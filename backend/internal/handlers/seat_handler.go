package handlers

import (
	"net/http"

	"beachboys-concert-backend/internal/services"

	"github.com/labstack/echo/v4"
)

type SeatHandler struct {
	seatService *services.SeatService
}

func NewSeatHandler(seatService *services.SeatService) *SeatHandler {
	return &SeatHandler{seatService: seatService}
}

// GET /api/seats?block=i  atau  ?section=CAT2
func (h *SeatHandler) GetSeats(c echo.Context) error {
	block := c.QueryParam("block")
	section := c.QueryParam("section")

	var err error
	var seats interface{}

	if block != "" {
		seats, err = h.seatService.GetSeatsByBlock(block)
	} else if section != "" {
		seats, err = h.seatService.GetSeatsBySection(section)
	} else {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "block or section required"})
	}

	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, seats)
}

// POST /api/seats/reserve
func (h *SeatHandler) ReserveSeats(c echo.Context) error {
	var req struct {
		SeatIDs []string `json:"seatIds"`
	}
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}
	if err := h.seatService.ValidateAndReserve(req.SeatIDs); err != nil {
		return c.JSON(http.StatusConflict, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, map[string]string{"message": "seats reserved"})
}

// POST /api/seats/release
func (h *SeatHandler) ReleaseSeats(c echo.Context) error {
	var req struct {
		SeatIDs []string `json:"seatIds"`
	}
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}
	if err := h.seatService.ReleaseSeats(req.SeatIDs); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, map[string]string{"message": "seats released"})
}
