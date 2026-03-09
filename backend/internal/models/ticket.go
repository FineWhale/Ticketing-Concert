package models

import (
	"time"

	"gorm.io/gorm"
)

type TicketStock struct {
	ID        string         `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	Section   string         `gorm:"type:varchar(50);not null;uniqueIndex:idx_section_type" json:"section"`
	Type      string         `gorm:"type:varchar(20);not null;uniqueIndex:idx_section_type" json:"type"`
	Stock     int            `gorm:"not null;default:0" json:"stock"`
	Price     int64          `gorm:"not null;default:0" json:"price"`
	CreatedAt time.Time      `json:"createdAt"`
	UpdatedAt time.Time      `json:"updatedAt"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

func (TicketStock) TableName() string { return "ticket_stocks" }

type UpsertStockRequest struct {
	Section string `json:"section"`
	Type    string `json:"type"`
	Stock   int    `json:"stock"`
	Price   int64  `json:"price"`
}
