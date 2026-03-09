export interface AdminStats {
  totalRevenue: number;
  totalOrders: number;
  paidOrders: number;
  pendingOrders: number;
  totalTicketsSold: number;
}

export interface SalesChartPoint {
  date: string;
  revenue: number;
  orders: number;
}

export interface TicketStock {
  id: string;
  section: string;
  type: string;
  stock: number;
  price: number;
}

export interface AdminOrderItem {
  section: string;
  type: string;
  quantity: number;
  priceEach: number;
}

export interface AdminOrder {
  id: string;
  orderCode: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  totalAmount: number;
  status: "pending" | "paid" | "failed" | "expired";
  createdAt: string;
  items: AdminOrderItem[];
}
