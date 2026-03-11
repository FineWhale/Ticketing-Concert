package services

import (
	"errors"
	"fmt"
	"sync"
	"time"

	"beachboys-concert-backend/internal/models"
	"beachboys-concert-backend/internal/repository"

	"gorm.io/gorm"
)

type OrderService struct {
	orderRepo       *repository.OrderRepository
	midtransService *MidtransService
	seatService     *SeatService
	db              *gorm.DB
}

func NewOrderService(
	orderRepo *repository.OrderRepository,
	midtransService *MidtransService,
	seatService *SeatService,
	db *gorm.DB,
) *OrderService {
	return &OrderService{
		orderRepo:       orderRepo,
		midtransService: midtransService,
		seatService:     seatService,
		db:              db,
	}
}

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

func (s *OrderService) reserveStock(items []models.OrderItemRequest) error {
	return s.db.Transaction(func(tx *gorm.DB) error {
		for _, item := range items {
			result := tx.Model(&models.TicketStock{}).
				Where("section = ? AND type = ? AND stock >= ?", item.Section, item.Type, item.Quantity).
				Update("stock", gorm.Expr("stock - ?", item.Quantity))
			if result.Error != nil {
				return result.Error
			}
			if result.RowsAffected == 0 {
				return fmt.Errorf("stok tidak cukup untuk section %s (%s)", item.Section, item.Type)
			}
		}
		return nil
	})
}

func (s *OrderService) releaseStock(items []models.OrderItem) error {
	return s.db.Transaction(func(tx *gorm.DB) error {
		for _, item := range items {
			tx.Model(&models.TicketStock{}).
				Where("section = ? AND type = ?", item.Section, item.Type).
				Update("stock", gorm.Expr("stock + ?", item.Quantity))
		}
		return nil
	})
}

func (s *OrderService) releaseStockFromRequest(items []models.OrderItemRequest) error {
	return s.db.Transaction(func(tx *gorm.DB) error {
		for _, item := range items {
			tx.Model(&models.TicketStock{}).
				Where("section = ? AND type = ?", item.Section, item.Type).
				Update("stock", gorm.Expr("stock + ?", item.Quantity))
		}
		return nil
	})
}

func (s *OrderService) ReleaseStockForOrder(orderCode string) error {
	order, err := s.orderRepo.FindByOrderCode(orderCode)
	if err != nil || order == nil {
		return err
	}
	return s.releaseStock(order.Items)
}

func (s *OrderService) CreateOrder(userID string, req *models.CreateOrderRequest) (*models.CreateOrderResponse, error) {
	if len(req.Items) == 0 {
		return nil, errors.New("order must have at least one item")
	}

	totalAmount, err := s.validateItemsConcurrently(req.Items)
	if err != nil {
		return nil, err
	}

	if err := s.reserveStock(req.Items); err != nil {
		return nil, err
	}

	if len(req.SeatIDs) > 0 {
		if err := s.seatService.ValidateAndReserve(req.SeatIDs); err != nil {
			_ = s.releaseStockFromRequest(req.Items)
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
		_ = s.releaseStockFromRequest(req.Items)
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
		_ = s.releaseStockFromRequest(req.Items)
		if len(req.SeatIDs) > 0 {
			_ = s.seatService.ReleaseSeats(req.SeatIDs)
		}
		return nil, fmt.Errorf("failed to create order items: %w", err)
	}

	order.Items = items

	if len(req.SeatIDs) > 0 {
		if err := s.seatService.MarkSold(req.SeatIDs, order.ID); err != nil {
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

// SyncOrderStatus — cek status ke Midtrans lalu update DB
// Dipanggil dari frontend setelah user selesai di payment page
func (s *OrderService) SyncOrderStatus(orderCode string) (*models.Order, error) {
	order, err := s.orderRepo.FindByOrderCode(orderCode)
	if err != nil {
		return nil, err
	}
	if order == nil {
		return nil, errors.New("order not found")
	}

	// Kalau sudah final, tidak perlu cek lagi
	if order.Status == "paid" || order.Status == "failed" {
		return order, nil
	}

	newStatus, err := s.midtransService.CheckTransactionStatus(orderCode)
	if err != nil {
		// Kalau gagal cek (misal order belum ada di Midtrans), kembalikan order apa adanya
		return order, nil
	}

	if newStatus != order.Status {
		_ = s.orderRepo.UpdateStatus(orderCode, newStatus)
		order.Status = newStatus

		// Jika failed → release stock
		if newStatus == "failed" {
			if err := s.releaseStock(order.Items); err != nil {
				fmt.Printf("Warning: failed to release stock for order %s: %v\n", orderCode, err)
			}
		}
	}

	return order, nil
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
