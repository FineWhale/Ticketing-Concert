package handlers

import (
	"crypto/sha512"
	"fmt"
	"net/http"
	"os"

	"beachboys-concert-backend/internal/services"

	"github.com/labstack/echo/v4"
)

type PaymentHandler struct {
	orderService *services.OrderService
}

func NewPaymentHandler(orderService *services.OrderService) *PaymentHandler {
	return &PaymentHandler{orderService: orderService}
}

// POST /api/payment/notification
func (h *PaymentHandler) HandleNotification(c echo.Context) error {
	var payload map[string]interface{}
	if err := c.Bind(&payload); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid payload"})
	}

	orderCode, _ := payload["order_id"].(string)
	statusCode, _ := payload["status_code"].(string)
	grossAmount, _ := payload["gross_amount"].(string)
	signatureKey, _ := payload["signature_key"].(string)
	transactionStatus, _ := payload["transaction_status"].(string)
	fraudStatus, _ := payload["fraud_status"].(string)

	serverKey := os.Getenv("MIDTRANS_SERVER_KEY")
	hash := sha512.Sum512([]byte(orderCode + statusCode + grossAmount + serverKey))
	expectedSig := fmt.Sprintf("%x", hash)

	if signatureKey != expectedSig {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "invalid signature"})
	}

	var status string
	switch transactionStatus {
	case "capture":
		if fraudStatus == "accept" {
			status = "paid"
		} else {
			status = "failed"
		}
	case "settlement":
		status = "paid"
	case "deny", "cancel", "expire":
		status = "failed"
	default:
		status = "pending"
	}

	if err := h.orderService.UpdateOrderStatus(orderCode, status); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	// ✅ Jika payment gagal/expired → kembalikan stock ke ticket_stocks
	if status == "failed" {
		if err := h.orderService.ReleaseStockForOrder(orderCode); err != nil {
			fmt.Printf("Warning: failed to release stock for order %s: %v\n", orderCode, err)
		}
	}

	return c.JSON(http.StatusOK, map[string]string{"status": "ok"})
}
