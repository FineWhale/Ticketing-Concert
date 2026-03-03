package services

import (
	"errors"
	"fmt"
	"time"

	"beachboys-concert-backend/internal/models"
	"beachboys-concert-backend/internal/repository"
)

type OrderService struct {
	orderRepo       *repository.OrderRepository
	midtransService *MidtransService
}

func NewOrderService(orderRepo *repository.OrderRepository, midtransService *MidtransService) *OrderService {
	return &OrderService{orderRepo: orderRepo, midtransService: midtransService}
}

func (s *OrderService) CreateOrder(userID string, req *models.CreateOrderRequest) (*models.CreateOrderResponse, error) {
	if len(req.Items) == 0 {
		return nil, errors.New("order must have at least one item")
	}

	var totalAmount int64
	for _, item := range req.Items {
		totalAmount += item.PriceEach * int64(item.Quantity)
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
		return nil, fmt.Errorf("failed to create order items: %w", err)
	}

	order.Items = items

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
		SnapToken:   snapToken,  // ← BARU
		PaymentURL:  paymentURL, // ← BARU
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
