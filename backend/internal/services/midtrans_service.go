package services

import (
	"fmt"

	"beachboys-concert-backend/internal/models"

	"github.com/midtrans/midtrans-go"
	"github.com/midtrans/midtrans-go/coreapi"
	"github.com/midtrans/midtrans-go/snap"
)

type MidtransService struct {
	client     snap.Client
	coreClient coreapi.Client
}

func NewMidtransService(serverKey string) *MidtransService {
	var client snap.Client
	client.New(serverKey, midtrans.Sandbox)

	var coreClient coreapi.Client
	coreClient.New(serverKey, midtrans.Sandbox)

	return &MidtransService{
		client:     client,
		coreClient: coreClient,
	}
}

func (s *MidtransService) CreateSnapToken(order *models.Order) (string, string, error) {
	var items []midtrans.ItemDetails
	for _, item := range order.Items {
		items = append(items, midtrans.ItemDetails{
			ID:    item.ID,
			Name:  fmt.Sprintf("%s - %s", item.Section, item.Type),
			Price: item.PriceEach,
			Qty:   int32(item.Quantity),
		})
	}

	req := &snap.Request{
		TransactionDetails: midtrans.TransactionDetails{
			OrderID:  order.OrderCode,
			GrossAmt: order.TotalAmount,
		},
		CustomerDetail: &midtrans.CustomerDetails{
			FName: order.CustomerName,
			Email: order.CustomerEmail,
			Phone: order.CustomerPhone,
		},
		Items: &items,
	}

	snapResp, err := s.client.CreateTransaction(req)
	if err != nil {
		return "", "", fmt.Errorf("midtrans error: %w", err)
	}

	return snapResp.Token, snapResp.RedirectURL, nil
}

// CheckTransactionStatus — cek status langsung ke Midtrans Core API
// Dipakai oleh sync-status endpoint agar tidak bergantung pada webhook
func (s *MidtransService) CheckTransactionStatus(orderCode string) (string, error) {
	res, err := s.coreClient.CheckTransaction(orderCode)
	if err != nil {
		return "", fmt.Errorf("midtrans check error: %w", err)
	}

	switch res.TransactionStatus {
	case "capture":
		if res.FraudStatus == "accept" {
			return "paid", nil
		}
		return "failed", nil
	case "settlement":
		return "paid", nil
	case "deny", "cancel", "expire":
		return "failed", nil
	case "pending":
		return "pending", nil
	default:
		return "pending", nil
	}
}
