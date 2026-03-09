package models

type AdminStats struct {
	TotalRevenue     int64 `json:"totalRevenue"`
	TotalOrders      int64 `json:"totalOrders"`
	PaidOrders       int64 `json:"paidOrders"`
	PendingOrders    int64 `json:"pendingOrders"`
	TotalTicketsSold int64 `json:"totalTicketsSold"`
}

type SalesChartPoint struct {
	Date    string `json:"date"`
	Revenue int64  `json:"revenue"`
	Orders  int64  `json:"orders"`
}
