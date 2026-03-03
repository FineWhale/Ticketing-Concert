package repository

import (
	"beachboys-concert-backend/internal/models"
	"errors"

	"gorm.io/gorm"
)

type OrderRepository struct {
	db *gorm.DB
}

func NewOrderRepository(db *gorm.DB) *OrderRepository {
	return &OrderRepository{db: db}
}

// Create order saja dulu, tanpa items
func (r *OrderRepository) CreateOrderOnly(order *models.Order) error {
	return r.db.Omit("Items").Create(order).Error
}

// Create items setelah order sudah ada ID-nya
func (r *OrderRepository) CreateItems(items []models.OrderItem) error {
	if len(items) == 0 {
		return nil
	}
	return r.db.Create(&items).Error
}

// Legacy - tetap ada untuk backward compat
func (r *OrderRepository) Create(order *models.Order) error {
	return r.db.Create(order).Error
}

func (r *OrderRepository) FindByID(id string) (*models.Order, error) {
	var order models.Order
	err := r.db.Preload("Items").Where("id = ?", id).First(&order).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &order, nil
}

func (r *OrderRepository) FindByOrderCode(code string) (*models.Order, error) {
	var order models.Order
	err := r.db.Preload("Items").Where("order_code = ?", code).First(&order).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &order, nil
}

func (r *OrderRepository) FindByUserID(userID string, limit, offset int) ([]models.Order, error) {
	var orders []models.Order
	err := r.db.Preload("Items").
		Where("user_id = ?", userID).
		Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&orders).Error
	return orders, err
}

func (r *OrderRepository) UpdateStatus(orderCode, status string) error {
	return r.db.Model(&models.Order{}).
		Where("order_code = ?", orderCode).
		Update("status", status).Error
}

func (r *OrderRepository) UpdateSnapToken(orderID, snapToken, paymentURL string) error {
	return r.db.Model(&models.Order{}).
		Where("id = ?", orderID).
		Updates(map[string]interface{}{
			"snap_token":  snapToken,
			"payment_url": paymentURL,
		}).Error
}
