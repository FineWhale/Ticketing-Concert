package models

import (
	"time"

	"gorm.io/gorm"
)

type Order struct {
	ID            string         `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	UserID        string         `gorm:"type:uuid;not null;index" json:"userId"`
	OrderCode     string         `gorm:"type:varchar(50);unique;not null;index" json:"orderCode"`
	TotalAmount   int64          `gorm:"not null" json:"totalAmount"`
	Status        string         `gorm:"type:varchar(20);default:'pending';index" json:"status"` // pending, paid, failed, expired
	CustomerName  string         `gorm:"type:varchar(100)" json:"customerName"`
	CustomerEmail string         `gorm:"type:varchar(100)" json:"customerEmail"`
	CustomerPhone string         `gorm:"type:varchar(20)" json:"customerPhone"`
	CreatedAt     time.Time      `json:"createdAt"`
	UpdatedAt     time.Time      `json:"updatedAt"`
	DeletedAt     gorm.DeletedAt `gorm:"index" json:"-"`
	Items         []OrderItem    `gorm:"foreignKey:OrderID;constraint:OnDelete:CASCADE" json:"items"`
	SnapToken     string         `gorm:"type:varchar(255)" json:"snapToken"`
	PaymentURL    string         `gorm:"type:varchar(255)" json:"paymentUrl"`
}

type OrderItem struct {
	ID        string `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	OrderID   string `gorm:"type:uuid;not null;index" json:"orderId"`
	Section   string `gorm:"type:varchar(50);not null" json:"section"`
	Type      string `gorm:"type:varchar(20);not null" json:"type"`
	Quantity  int    `gorm:"not null" json:"quantity"`
	PriceEach int64  `gorm:"not null" json:"priceEach"`
}

// Request & Response DTOs
type CreateOrderRequest struct {
	Items         []OrderItemRequest `json:"items" binding:"required"`
	CustomerName  string             `json:"customerName" binding:"required"`
	CustomerEmail string             `json:"customerEmail" binding:"required,email"`
	CustomerPhone string             `json:"customerPhone" binding:"required"`
}

type OrderItemRequest struct {
	Section   string `json:"section" binding:"required"`
	Type      string `json:"type" binding:"required"`
	Quantity  int    `json:"quantity" binding:"required,min=1"`
	PriceEach int64  `json:"priceEach" binding:"required,min=1"`
}

type CreateOrderResponse struct {
	OrderID     string `json:"orderId"`
	OrderCode   string `json:"orderCode"`
	TotalAmount int64  `json:"totalAmount"`
	Status      string `json:"status"`
	SnapToken   string `json:"snapToken"`
	PaymentURL  string `json:"paymentUrl"`
}

type OrderDetailResponse struct {
	Order
}

func (Order) TableName() string {
	return "orders"
}

func (OrderItem) TableName() string {
	return "order_items"
}
