package repository

import (
	"beachboys-concert-backend/internal/models"

	"gorm.io/gorm"
)

type SeatRepository struct {
	db *gorm.DB
}

func NewSeatRepository(db *gorm.DB) *SeatRepository {
	return &SeatRepository{db: db}
}

func (r *SeatRepository) GetBySection(section string) ([]models.Seat, error) {
	var seats []models.Seat
	err := r.db.Where("section = ?", section).Order("block, row, number").Find(&seats).Error
	return seats, err
}

func (r *SeatRepository) GetByBlock(block string) ([]models.Seat, error) {
	var seats []models.Seat
	err := r.db.Where("block = ?", block).Order("row, number").Find(&seats).Error
	return seats, err
}

func (r *SeatRepository) GetByIDs(ids []string) ([]models.Seat, error) {
	var seats []models.Seat
	err := r.db.Where("id IN ?", ids).Find(&seats).Error
	return seats, err
}

func (r *SeatRepository) CountByBlock(block string) (int64, error) {
	var count int64
	err := r.db.Model(&models.Seat{}).Where("block = ?", block).Count(&count).Error
	return count, err
}

func (r *SeatRepository) ReserveSeats(ids []string) error {
	return r.db.Model(&models.Seat{}).
		Where("id IN ? AND status = 'available'", ids).
		Update("status", "reserved").Error
}

func (r *SeatRepository) MarkSold(ids []string, orderID string) error {
	return r.db.Model(&models.Seat{}).
		Where("id IN ?", ids).
		Updates(map[string]interface{}{
			"status":   "sold",
			"order_id": orderID,
		}).Error
}

func (r *SeatRepository) ReleaseSeats(ids []string) error {
	return r.db.Model(&models.Seat{}).
		Where("id IN ? AND status = 'reserved'", ids).
		Updates(map[string]interface{}{
			"status":   "available",
			"order_id": nil,
		}).Error
}

func (r *SeatRepository) SeedSeats(seats []models.Seat) error {
	return r.db.CreateInBatches(seats, 100).Error
}
