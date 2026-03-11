package services

import (
	"errors"
	"fmt"
	"sync"
	"time"

	"beachboys-concert-backend/internal/models"
	"beachboys-concert-backend/internal/repository"
)

type OrderService struct {
	orderRepo       *repository.OrderRepository
	midtransService *MidtransService
	seatService     *SeatService // ← tambah
}

func NewOrderService(
	orderRepo *repository.OrderRepository,
	midtransService *MidtransService,
	seatService *SeatService,
) *OrderService {
	return &OrderService{
		orderRepo:       orderRepo,
		midtransService: midtransService,
		seatService:     seatService,
	}
}

// validateItemsConcurrently — Go concurrency: validasi semua item secara parallel
func (s *OrderService) validateItemsConcurrently(items []models.OrderItemRequest) (int64, error) {
	type result struct {
		subtotal int64
		err      error
	}

	resultCh := make(chan result, len(items))
	var wg sync.WaitGroup

	for _, item := range items {
		wg.Add(1)
		go func(it models.OrderItemRequest) {
			defer wg.Done()
			if it.Quantity <= 0 {
				resultCh <- result{err: fmt.Errorf("invalid quantity for section %s", it.Section)}
				return
			}
			if it.PriceEach <= 0 {
				resultCh <- result{err: fmt.Errorf("invalid price for section %s", it.Section)}
				return
			}
			resultCh <- result{subtotal: it.PriceEach * int64(it.Quantity)}
		}(item)
	}

	go func() {
		wg.Wait()
		close(resultCh)
	}()

	var totalAmount int64
	for res := range resultCh {
		if res.err != nil {
			return 0, res.err
		}
		totalAmount += res.subtotal
	}

	return totalAmount, nil
}

func (s *OrderService) CreateOrder(userID string, req *models.CreateOrderRequest) (*models.CreateOrderResponse, error) {
	if len(req.Items) == 0 {
		return nil, errors.New("order must have at least one item")
	}

	// ✅ Concurrent validation
	totalAmount, err := s.validateItemsConcurrently(req.Items)
	if err != nil {
		return nil, err
	}

	// ✅ Jika ada seat yang dipilih (CAT2/CAT4), reserve dulu sebelum order dibuat
	// Kalau reserve gagal (seat sudah diambil orang lain), batalkan langsung
	if len(req.SeatIDs) > 0 {
		if err := s.seatService.ValidateAndReserve(req.SeatIDs); err != nil {
			return nil, fmt.Errorf("seat reservation failed: %w", err)
		}
	}

	orderCode := fmt.Sprintf("BBK-%d", time.Now().UnixMilli())

	order := &models.Order{
		UserID:        userID,
		OrderCode:     orderCode,
		TotalAmount:   totalAmount,
		Status:        "pending",
		CustomerName:  req.CustomerName,
		CustomerEmail: req.CustomerEmail,
		CustomerPhone: req.CustomerPhone,
	}

	if err := s.orderRepo.CreateOrderOnly(order); err != nil {
		// Kalau order gagal dibuat, release seat yang sudah di-reserve
		if len(req.SeatIDs) > 0 {
			_ = s.seatService.ReleaseSeats(req.SeatIDs)
		}
		return nil, fmt.Errorf("failed to create order: %w", err)
	}

	var items []models.OrderItem
	for _, item := range req.Items {
		items = append(items, models.OrderItem{
			OrderID:   order.ID,
			Section:   item.Section,
			Type:      item.Type,
			Quantity:  item.Quantity,
			PriceEach: item.PriceEach,
		})
	}

	if err := s.orderRepo.CreateItems(items); err != nil {
		if len(req.SeatIDs) > 0 {
			_ = s.seatService.ReleaseSeats(req.SeatIDs)
		}
		return nil, fmt.Errorf("failed to create order items: %w", err)
	}

	order.Items = items

	// ✅ Tandai seat sebagai sold setelah order berhasil dibuat
	if len(req.SeatIDs) > 0 {
		if err := s.seatService.MarkSold(req.SeatIDs, order.ID); err != nil {
			// Log saja, jangan batalkan order
			fmt.Printf("Warning: failed to mark seats as sold for order %s: %v\n", order.ID, err)
		}
	}

	snapToken, paymentURL, err := s.midtransService.CreateSnapToken(order)
	if err != nil {
		return nil, fmt.Errorf("failed to create payment token: %w", err)
	}

	_ = s.orderRepo.UpdateSnapToken(order.ID, snapToken, paymentURL)

	return &models.CreateOrderResponse{
		OrderID:     order.ID,
		OrderCode:   order.OrderCode,
		TotalAmount: order.TotalAmount,
		Status:      order.Status,
		SnapToken:   snapToken,
		PaymentURL:  paymentURL,
	}, nil
}

func (s *OrderService) GetOrderByCode(orderCode string) (*models.Order, error) {
	order, err := s.orderRepo.FindByOrderCode(orderCode)
	if err != nil {
		return nil, err
	}
	if order == nil {
		return nil, errors.New("order not found")
	}
	return order, nil
}

func (s *OrderService) GetUserOrders(userID string, page, perPage int) ([]models.Order, error) {
	offset := (page - 1) * perPage
	return s.orderRepo.FindByUserID(userID, perPage, offset)
}

func (s *OrderService) UpdateOrderStatus(orderCode, status string) error {
	validStatuses := map[string]bool{
		"pending": true,
		"paid":    true,
		"failed":  true,
		"expired": true,
	}
	if !validStatuses[status] {
		return errors.New("invalid order status")
	}
	return s.orderRepo.UpdateStatus(orderCode, status)
}
