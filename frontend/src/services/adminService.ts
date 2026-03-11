import axios from "axios";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:5000/api";

const api = axios.create({ baseURL: API_BASE_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const adminService = {
  async getStats() {
    const res = await api.get("/admin/stats");
    return res.data.data;
  },

  async getSalesChart(days = 30) {
    const res = await api.get(`/admin/sales-chart?days=${days}`);
    return res.data.data ?? [];
  },

  async getOrders(page = 1, limit = 20, status = "") {
    const params: Record<string, string> = {
      page: String(page),
      limit: String(limit),
    };
    if (status) params.status = status;
    const res = await api.get("/admin/orders", { params });
    return res.data;
  },

  async getTicketStocks() {
    const res = await api.get("/admin/ticket-stocks");
    return res.data.data ?? [];
  },

  // Dipakai untuk inline-edit (update by ID)
  async updateTicketStock(
    id: string,
    payload: { stock?: number; price?: number },
  ) {
    const res = await api.patch(`/admin/ticket-stocks/${id}`, payload);
    return res.data.data;
  },

  // Tetap ada untuk backward compat jika masih dipakai
  async upsertTicketStock(payload: {
    section: string;
    type: string;
    stock: number;
    price: number;
  }) {
    const res = await api.post("/admin/ticket-stocks", payload);
    return res.data.data;
  },
};
