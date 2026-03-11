package models

import "time"

type Seat struct {
	ID        string    `gorm:"primaryKey;default:gen_random_uuid()" json:"id"`
	Section   string    `gorm:"not null;index" json:"section"`              // "CAT2", "CAT4"
	Block     string    `gorm:"not null" json:"block"`                      // "i", "j", "k", "l"
	Row       string    `gorm:"not null" json:"row"`                        // "A", "B", "C"
	Number    int       `gorm:"not null" json:"number"`                     // 1, 2, 3...
	Status    string    `gorm:"not null;default:'available'" json:"status"` // available | reserved | sold
	OrderID   *string   `gorm:"index" json:"orderId,omitempty"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

func (Seat) TableName() string { return "seats" }

// Request/Response
type ReserveSeatRequest struct {
	SeatIDs []string `json:"seatIds"`
}

type SeatResponse struct {
	ID      string `json:"id"`
	Section string `json:"section"`
	Block   string `json:"block"`
	Row     string `json:"row"`
	Number  int    `json:"number"`
	Status  string `json:"status"`
}
