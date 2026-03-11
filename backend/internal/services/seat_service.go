package services

import (
	"errors"
	"fmt"
	"sync"

	"beachboys-concert-backend/internal/models"
	"beachboys-concert-backend/internal/repository"
)

type SeatService struct {
	seatRepo *repository.SeatRepository
}

func NewSeatService(seatRepo *repository.SeatRepository) *SeatService {
	return &SeatService{seatRepo: seatRepo}
}

func (s *SeatService) GetSeatsBySection(section string) ([]models.Seat, error) {
	return s.seatRepo.GetBySection(section)
}

func (s *SeatService) GetSeatsByBlock(block string) ([]models.Seat, error) {
	return s.seatRepo.GetByBlock(block)
}

// ValidateAndReserve — cek semua seat available secara concurrent lalu reserve
func (s *SeatService) ValidateAndReserve(seatIDs []string) error {
	if len(seatIDs) == 0 {
		return errors.New("no seats selected")
	}

	seats, err := s.seatRepo.GetByIDs(seatIDs)
	if err != nil {
		return err
	}
	if len(seats) != len(seatIDs) {
		return errors.New("one or more seats not found")
	}

	type result struct {
		seatID string
		err    error
	}

	resultCh := make(chan result, len(seats))
	var wg sync.WaitGroup

	for _, seat := range seats {
		wg.Add(1)
		go func(s models.Seat) {
			defer wg.Done()
			if s.Status != "available" {
				resultCh <- result{seatID: s.ID, err: fmt.Errorf("seat %s-%s%d is already %s", s.Block, s.Row, s.Number, s.Status)}
				return
			}
			resultCh <- result{seatID: s.ID, err: nil}
		}(seat)
	}

	go func() {
		wg.Wait()
		close(resultCh)
	}()

	for res := range resultCh {
		if res.err != nil {
			return res.err
		}
	}

	return s.seatRepo.ReserveSeats(seatIDs)
}

func (s *SeatService) MarkSold(seatIDs []string, orderID string) error {
	return s.seatRepo.MarkSold(seatIDs, orderID)
}

func (s *SeatService) ReleaseSeats(seatIDs []string) error {
	return s.seatRepo.ReleaseSeats(seatIDs)
}

// SeedIfEmpty — generate seat per block
func (s *SeatService) SeedIfEmpty() error {
	configs := []struct {
		section     string
		block       string
		rows        int
		seatsPerRow int
	}{
		{"CAT2", "i", 12, 25},
		{"CAT2", "j", 12, 25},
		{"CAT4", "k", 6, 18},
		{"CAT4", "l", 6, 18},
	}

	for _, cfg := range configs {
		count, err := s.seatRepo.CountByBlock(cfg.block)
		if err != nil {
			return err
		}
		if count > 0 {
			continue
		}

		var seats []models.Seat
		for r := 0; r < cfg.rows; r++ {
			rowLabel := string(rune('A' + r))
			for n := 1; n <= cfg.seatsPerRow; n++ {
				seats = append(seats, models.Seat{
					Section: cfg.section,
					Block:   cfg.block,
					Row:     rowLabel,
					Number:  n,
					Status:  "available",
				})
			}
		}
		if err := s.seatRepo.SeedSeats(seats); err != nil {
			return err
		}
	}
	return nil
}
