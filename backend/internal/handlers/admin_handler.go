package handlers

import (
	"net/http"
	"strconv"
	"time"

	"beachboys-concert-backend/internal/models"

	"github.com/labstack/echo/v4"
	"gorm.io/gorm"
)

type AdminHandler struct {
	db *gorm.DB
}

func NewAdminHandler(db *gorm.DB) *AdminHandler {
	return &AdminHandler{db: db}
}

var sectionBlockMap = map[string]string{
	"CAT 2 I": "i",
	"CAT 2 J": "j",
	"CAT 4 K": "k",
	"CAT 4 L": "l",
}

func (h *AdminHandler) GetStats(c echo.Context) error {
	var stats models.AdminStats

	h.db.Model(&models.Order{}).Count(&stats.TotalOrders)
	h.db.Model(&models.Order{}).Where("status = ?", "paid").Count(&stats.PaidOrders)
	h.db.Model(&models.Order{}).Where("status = ?", "pending").Count(&stats.PendingOrders)

	h.db.Model(&models.Order{}).
		Where("status = ?", "paid").
		Select("COALESCE(SUM(total_amount), 0)").
		Scan(&stats.TotalRevenue)

	h.db.Model(&models.OrderItem{}).
		Joins("JOIN orders ON orders.id = order_items.order_id").
		Where("orders.status = ?", "paid").
		Select("COALESCE(SUM(order_items.quantity), 0)").
		Scan(&stats.TotalTicketsSold)

	return c.JSON(http.StatusOK, map[string]interface{}{"data": stats})
}

func (h *AdminHandler) GetSalesChart(c echo.Context) error {
	days := 30
	if d, err := strconv.Atoi(c.QueryParam("days")); err == nil && d > 0 {
		days = d
	}

	since := time.Now().AddDate(0, 0, -days)
	var data []models.SalesChartPoint

	h.db.Model(&models.Order{}).
		Where("status = ? AND created_at >= ?", "paid", since).
		Select("TO_CHAR(created_at, 'YYYY-MM-DD') as date, SUM(total_amount) as revenue, COUNT(*) as orders").
		Group("TO_CHAR(created_at, 'YYYY-MM-DD')").
		Order("date ASC").
		Scan(&data)

	return c.JSON(http.StatusOK, map[string]interface{}{"data": data})
}

func (h *AdminHandler) GetOrders(c echo.Context) error {
	page, _ := strconv.Atoi(c.QueryParam("page"))
	if page < 1 {
		page = 1
	}
	limit, _ := strconv.Atoi(c.QueryParam("limit"))
	if limit < 1 {
		limit = 20
	}
	status := c.QueryParam("status")

	var orders []models.Order
	var total int64

	query := h.db.Model(&models.Order{}).Preload("Items")
	if status != "" {
		query = query.Where("status = ?", status)
	}

	query.Count(&total)
	query.Offset((page - 1) * limit).Limit(limit).Order("created_at DESC").Find(&orders)

	return c.JSON(http.StatusOK, map[string]interface{}{
		"orders": orders,
		"total":  total,
		"page":   page,
		"limit":  limit,
	})
}

// GetTicketStocks — stok seat-based dihitung live dari tabel seats,
// stok non-seat (standing) tetap dari ticket_stocks.
func (h *AdminHandler) GetTicketStocks(c echo.Context) error {
	var stocks []models.TicketStock
	h.db.Order("section, type").Find(&stocks)

	for i, s := range stocks {
		block, ok := sectionBlockMap[s.Section]
		if !ok {
			// Non-seat section (standing), pakai stock dari DB apa adanya
			continue
		}
		var count int64
		h.db.Model(&models.Seat{}).
			Where("block = ? AND status = 'available'", block).
			Count(&count)
		stocks[i].Stock = int(count)
	}

	return c.JSON(http.StatusOK, map[string]interface{}{"data": stocks})
}

// UpsertTicketStock — tetap ada untuk backward compat (POST)
func (h *AdminHandler) UpsertTicketStock(c echo.Context) error {
	var req models.UpsertStockRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}
	if req.Section == "" || req.Type == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "section and type are required"})
	}

	var stock models.TicketStock
	err := h.db.Where("section = ? AND type = ?", req.Section, req.Type).First(&stock).Error

	if err != nil {
		stock = models.TicketStock{
			Section: req.Section,
			Type:    req.Type,
			Stock:   req.Stock,
			Price:   req.Price,
		}
		h.db.Create(&stock)
	} else {
		h.db.Model(&stock).Updates(map[string]interface{}{
			"stock": req.Stock,
			"price": req.Price,
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{"data": stock})
}

// UpdateTicketStockByID — PATCH /admin/ticket-stocks/:id
func (h *AdminHandler) UpdateTicketStockByID(c echo.Context) error {
	id := c.Param("id")
	if id == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "id is required"})
	}

	var req struct {
		Stock *int   `json:"stock"`
		Price *int64 `json:"price"`
	}
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}

	var stock models.TicketStock
	if err := h.db.Where("id = ?", id).First(&stock).Error; err != nil {
		return c.JSON(http.StatusNotFound, map[string]string{"error": "ticket stock not found"})
	}

	updates := map[string]interface{}{}
	if req.Stock != nil {
		updates["stock"] = *req.Stock
	}
	if req.Price != nil {
		updates["price"] = *req.Price
	}

	if len(updates) == 0 {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "nothing to update"})
	}

	h.db.Model(&stock).Updates(updates)

	return c.JSON(http.StatusOK, map[string]interface{}{"data": stock})
}
