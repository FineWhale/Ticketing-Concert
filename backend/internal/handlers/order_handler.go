package handlers

import (
	"fmt"
	"net/http"
	"strconv"

	"beachboys-concert-backend/internal/models"
	"beachboys-concert-backend/internal/services"

	"github.com/labstack/echo/v4"
)

type OrderHandler struct {
	orderService *services.OrderService
}

func NewOrderHandler(orderService *services.OrderService) *OrderHandler {
	return &OrderHandler{orderService: orderService}
}

// POST /api/orders
func (h *OrderHandler) CreateOrder(c echo.Context) error {
	userID, ok := c.Get("userID").(string)
	if !ok || userID == "" {
		fmt.Printf("DEBUG: userID not found in context, raw value: %v (type: %T)\n", c.Get("userID"), c.Get("userID"))
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "Unauthorized"})
	}

	fmt.Printf("DEBUG: userID = '%s'\n", userID)

	var req models.CreateOrderRequest
	if err := c.Bind(&req); err != nil {
		fmt.Printf("DEBUG: Bind error = %v\n", err)
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request body"})
	}

	fmt.Printf("DEBUG: req = %+v\n", req)
	fmt.Printf("DEBUG: items count = %d\n", len(req.Items))

	// Basic validation
	if req.CustomerName == "" || req.CustomerEmail == "" || req.CustomerPhone == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Customer information required"})
	}

	if len(req.Items) == 0 {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Order must have at least one item"})
	}

	response, err := h.orderService.CreateOrder(userID, &req)
	if err != nil {
		fmt.Printf("DEBUG: CreateOrder service error = %v\n", err)
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	fmt.Printf("DEBUG: Order created successfully = %+v\n", response)
	return c.JSON(http.StatusCreated, response)
}

// GET /api/orders/:orderCode
func (h *OrderHandler) GetOrder(c echo.Context) error {
	orderCode := c.Param("orderCode")
	if orderCode == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Order code required"})
	}

	order, err := h.orderService.GetOrderByCode(orderCode)
	if err != nil {
		return c.JSON(http.StatusNotFound, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, order)
}

// GET /api/orders
func (h *OrderHandler) GetUserOrders(c echo.Context) error {
	userID, ok := c.Get("userID").(string)
	if !ok || userID == "" {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "Unauthorized"})
	}

	page, _ := strconv.Atoi(c.QueryParam("page"))
	if page < 1 {
		page = 1
	}
	perPage, _ := strconv.Atoi(c.QueryParam("perPage"))
	if perPage < 1 || perPage > 100 {
		perPage = 10
	}

	orders, err := h.orderService.GetUserOrders(userID, page, perPage)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to fetch orders"})
	}

	return c.JSON(http.StatusOK, orders)
}
