import React, { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { adminService } from "../../services/adminService";
import type {
  AdminStats,
  SalesChartPoint,
  TicketStock,
  AdminOrder,
} from "../../types/admin.types";

type Tab = "dashboard" | "orders" | "stocks";

const STATUS_COLORS: Record<string, string> = {
  paid: "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-700",
  failed: "bg-red-100 text-red-700",
  expired: "bg-gray-100 text-gray-500",
};

const formatRupiah = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(n);

const AdminPage: React.FC = () => {
  const [tab, setTab] = useState<Tab>("dashboard");

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [chartData, setChartData] = useState<SalesChartPoint[]>([]);

  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [orderTotal, setOrderTotal] = useState(0);
  const [orderPage, setOrderPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");

  const [stocks, setStocks] = useState<TicketStock[]>([]);
  const [stockForm, setStockForm] = useState({
    section: "",
    type: "",
    stock: 0,
    price: 0,
  });
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  useEffect(() => {
    adminService.getStats().then(setStats).catch(console.error);
    adminService.getSalesChart(30).then(setChartData).catch(console.error);
  }, []);

  useEffect(() => {
    if (tab !== "orders") return;
    adminService
      .getOrders(orderPage, 20, statusFilter)
      .then((res) => {
        setOrders(res.orders ?? []);
        setOrderTotal(res.total ?? 0);
      })
      .catch(console.error);
  }, [tab, orderPage, statusFilter]);

  useEffect(() => {
    if (tab !== "stocks") return;
    adminService.getTicketStocks().then(setStocks).catch(console.error);
  }, [tab]);

  const handleUpsertStock = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveMsg("");
    try {
      await adminService.upsertTicketStock(stockForm);
      const refreshed = await adminService.getTicketStocks();
      setStocks(refreshed);
      setStockForm({ section: "", type: "", stock: 0, price: 0 });
      setSaveMsg("✅ Saved!");
    } catch {
      setSaveMsg("❌ Failed to save.");
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMsg(""), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">
          🎟 Admin Panel — Beach Boys
        </h1>
        <a href="/" className="text-sm text-blue-600 hover:underline">
          ← Back to Site
        </a>
      </div>

      {/* Tabs */}
      <div className="px-6 pt-5 flex gap-2">
        {(
          [
            { key: "dashboard", label: "📊 Dashboard" },
            { key: "orders", label: "📦 Orders" },
            { key: "stocks", label: "🎫 Ticket Stock" },
          ] as { key: Tab; label: string }[]
        ).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              tab === key
                ? "bg-gray-900 text-white"
                : "bg-white border text-gray-600 hover:bg-gray-50"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="p-6">
        {/* ───────────── DASHBOARD ───────────── */}
        {tab === "dashboard" && (
          <div className="space-y-6">
            {/* Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                {
                  label: "Total Revenue",
                  value: formatRupiah(stats?.totalRevenue ?? 0),
                  icon: "💰",
                  color: "border-green-200 bg-green-50",
                },
                {
                  label: "Total Orders",
                  value: stats?.totalOrders ?? 0,
                  icon: "📋",
                  color: "border-blue-200 bg-blue-50",
                },
                {
                  label: "Paid Orders",
                  value: stats?.paidOrders ?? 0,
                  icon: "✅",
                  color: "border-emerald-200 bg-emerald-50",
                },
                {
                  label: "Tickets Sold",
                  value: stats?.totalTicketsSold ?? 0,
                  icon: "🎟",
                  color: "border-purple-200 bg-purple-50",
                },
              ].map((card) => (
                <div
                  key={card.label}
                  className={`rounded-xl border p-5 ${card.color}`}
                >
                  <div className="text-2xl mb-2">{card.icon}</div>
                  <div className="text-2xl font-bold text-gray-800">
                    {card.value}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">{card.label}</div>
                </div>
              ))}
            </div>

            {/* Sales Chart */}
            <div className="bg-white rounded-xl border p-6">
              <h2 className="font-semibold text-gray-700 mb-1">
                📈 Sales — Last 30 Days
              </h2>
              <p className="text-xs text-gray-400 mb-4">
                Revenue (left axis) & Orders count (right axis)
              </p>
              {chartData.length === 0 ? (
                <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
                  No sales data yet.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient
                        id="gradRevenue"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#6366F1"
                          stopOpacity={0.25}
                        />
                        <stop
                          offset="95%"
                          stopColor="#6366F1"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 11 }}
                      tickFormatter={(v: string) => v.slice(5)}
                    />
                    <YAxis
                      yAxisId="left"
                      tick={{ fontSize: 11 }}
                      tickFormatter={(v: number) =>
                        v >= 1000000
                          ? `${(v / 1000000).toFixed(1)}M`
                          : `${(v / 1000).toFixed(0)}K`
                      }
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      tick={{ fontSize: 11 }}
                    />
                    <Tooltip
                      formatter={(val, name) => [
                        name === "revenue" ? formatRupiah(Number(val)) : val,
                        name as string,
                      ]}
                    />
                    <Legend />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="revenue"
                      stroke="#6366F1"
                      fill="url(#gradRevenue)"
                      strokeWidth={2}
                      name="revenue"
                    />
                    <Area
                      yAxisId="right"
                      type="monotone"
                      dataKey="orders"
                      stroke="#10B981"
                      fill="none"
                      strokeWidth={2}
                      strokeDasharray="5 3"
                      name="orders"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        )}

        {/* ───────────── ORDERS ───────────── */}
        {tab === "orders" && (
          <div className="space-y-4">
            {/* Filter bar */}
            <div className="flex gap-2 flex-wrap items-center">
              {["", "pending", "paid", "failed", "expired"].map((s) => (
                <button
                  key={s || "all"}
                  onClick={() => {
                    setStatusFilter(s);
                    setOrderPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-sm border transition capitalize ${
                    statusFilter === s
                      ? "bg-gray-900 text-white border-gray-900"
                      : "bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {s || "All"}
                </button>
              ))}
              <span className="ml-auto text-sm text-gray-400">
                {orderTotal} total orders
              </span>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 text-left text-xs uppercase tracking-wide">
                  <tr>
                    {[
                      "Order Code",
                      "Customer",
                      "Items",
                      "Total",
                      "Status",
                      "Date",
                    ].map((h) => (
                      <th key={h} className="px-4 py-3 font-medium">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {orders.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="text-center py-12 text-gray-400"
                      >
                        No orders found.
                      </td>
                    </tr>
                  )}
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3 font-mono text-xs text-indigo-600 font-semibold">
                        {order.orderCode}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-800">
                          {order.customerName}
                        </div>
                        <div className="text-gray-400 text-xs">
                          {order.customerEmail}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs space-y-0.5">
                        {order.items?.map((item, i) => (
                          <div key={i}>
                            {item.quantity}× {item.section} ({item.type})
                          </div>
                        ))}
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-800">
                        {formatRupiah(order.totalAmount)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            STATUS_COLORS[order.status] ??
                            "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs">
                        {new Date(order.createdAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex gap-2 justify-end items-center">
              <button
                onClick={() => setOrderPage((p) => Math.max(1, p - 1))}
                disabled={orderPage === 1}
                className="px-3 py-1.5 border rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50"
              >
                ← Prev
              </button>
              <span className="text-sm text-gray-500 px-2">
                Page {orderPage}
              </span>
              <button
                onClick={() => setOrderPage((p) => p + 1)}
                disabled={orders.length < 20}
                className="px-3 py-1.5 border rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50"
              >
                Next →
              </button>
            </div>
          </div>
        )}

        {/* ───────────── TICKET STOCK ───────────── */}
        {tab === "stocks" && (
          <div className="space-y-6">
            {/* Form */}
            <div className="bg-white rounded-xl border p-6">
              <h2 className="font-semibold text-gray-700 mb-4">
                ➕ Add / Update Stock
              </h2>
              <form
                onSubmit={handleUpsertStock}
                className="grid grid-cols-2 md:grid-cols-4 gap-4"
              >
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-500 font-medium">
                    Section
                  </label>
                  <input
                    className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    placeholder="e.g. VIP"
                    value={stockForm.section}
                    onChange={(e) =>
                      setStockForm((f) => ({ ...f, section: e.target.value }))
                    }
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-500 font-medium">
                    Type
                  </label>
                  <input
                    className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    placeholder="e.g. standing"
                    value={stockForm.type}
                    onChange={(e) =>
                      setStockForm((f) => ({ ...f, type: e.target.value }))
                    }
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-500 font-medium">
                    Stock (qty)
                  </label>
                  <input
                    type="number"
                    min={0}
                    className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    value={stockForm.stock}
                    onChange={(e) =>
                      setStockForm((f) => ({
                        ...f,
                        stock: Number(e.target.value),
                      }))
                    }
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-500 font-medium">
                    Price (Rp)
                  </label>
                  <input
                    type="number"
                    min={0}
                    className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    value={stockForm.price}
                    onChange={(e) =>
                      setStockForm((f) => ({
                        ...f,
                        price: Number(e.target.value),
                      }))
                    }
                    required
                  />
                </div>
                <div className="col-span-2 md:col-span-4 flex items-center gap-4">
                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-gray-900 hover:bg-gray-700 text-white rounded-lg px-6 py-2 text-sm font-medium disabled:opacity-50 transition"
                  >
                    {saving ? "Saving..." : "Save Stock"}
                  </button>
                  {saveMsg && (
                    <span className="text-sm text-gray-600">{saveMsg}</span>
                  )}
                </div>
              </form>
            </div>

            {/* Stock Table */}
            <div className="bg-white rounded-xl border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide text-left">
                  <tr>
                    {["Section", "Type", "Stock", "Price"].map((h) => (
                      <th key={h} className="px-4 py-3 font-medium">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {stocks.length === 0 && (
                    <tr>
                      <td
                        colSpan={4}
                        className="text-center py-10 text-gray-400"
                      >
                        No stocks configured yet. Add one above.
                      </td>
                    </tr>
                  )}
                  {stocks.map((s) => (
                    <tr key={s.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3 font-semibold text-gray-800">
                        {s.section}
                      </td>
                      <td className="px-4 py-3 text-gray-600 capitalize">
                        {s.type}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`font-bold ${
                            s.stock === 0
                              ? "text-red-500"
                              : s.stock < 10
                                ? "text-yellow-500"
                                : "text-gray-800"
                          }`}
                        >
                          {s.stock}
                          {s.stock === 0 && " 🔴 Habis"}
                          {s.stock > 0 && s.stock < 10 && " ⚠️ Hampir habis"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {formatRupiah(s.price)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
