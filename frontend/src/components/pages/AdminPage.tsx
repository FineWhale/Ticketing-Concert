import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { Header } from "../organisms";
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
  failed: "bg-red-100 text-red-600",
  expired: "bg-gray-100 text-gray-500",
};
const STATUS_LABEL: Record<string, string> = {
  paid: "Lunas",
  pending: "Menunggu",
  failed: "Gagal",
  expired: "Kedaluwarsa",
};

const formatRupiah = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(n);

const IconRevenue = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    height="24"
    viewBox="0 -960 960 960"
    width="24"
    fill="currentColor"
  >
    <path d="M441-120v-86q-53-12-91.5-46T293-348l74-30q15 48 44.5 73t77.5 25q41 0 69.5-18.5T587-356q0-35-22-55.5T463-458q-86-27-118-64.5T313-614q0-65 42-101t86-41v-84h80v84q50 8 82.5 36.5T651-650l-74 32q-12-32-34-48t-60-16q-44 0-67 19.5T393-614q0 33 30 52t104 40q69 20 104.5 63.5T667-358q0 71-42 108t-104 46v84h-80Z" />
  </svg>
);
const IconOrders = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    height="24"
    viewBox="0 -960 960 960"
    width="24"
    fill="currentColor"
  >
    <path d="M320-280q17 0 28.5-11.5T360-320q0-17-11.5-28.5T320-360q-17 0-28.5 11.5T280-320q0 17 11.5 28.5T320-280Zm0-160q17 0 28.5-11.5T360-480q0-17-11.5-28.5T320-520q-17 0-28.5 11.5T280-480q0 17 11.5 28.5T320-440Zm0-160q17 0 28.5-11.5T360-640q0-17-11.5-28.5T320-680q-17 0-28.5 11.5T280-640q0 17 11.5 28.5T320-600Zm120 320h240v-80H440v80Zm0-160h240v-80H440v80Zm0-160h240v-80H440v80ZM200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-560H200v560Zm0-560v560-560Z" />
  </svg>
);
const IconPaid = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    height="24"
    viewBox="0 -960 960 960"
    width="24"
    fill="currentColor"
  >
    <path d="m424-296 282-282-56-56-226 226-114-114-56 56 170 170Zm56 216q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z" />
  </svg>
);
const IconTicket = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    height="24"
    viewBox="0 -960 960 960"
    width="24"
    fill="currentColor"
  >
    <path d="M160-280v-160q33 0 56.5-23.5T240-520q0-33-23.5-56.5T160-600v-160h640v160q-33 0-56.5 23.5T720-520q0 33 23.5 56.5T800-440v160H160Zm80-80h480v-104q-37-20-58.5-55.5T640-600q0-43 21.5-78.5T720-734v-26H240v26q37 20 58.5 55.5T320-600q0 43-21.5 78.5T240-466v106Zm240-190Z" />
  </svg>
);
const IconBox = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    height="24"
    viewBox="0 -960 960 960"
    width="24"
    fill="currentColor"
  >
    <path d="M480-80 120-280v-400l360-200 360 200v400L480-80Zm0-447 263-146-263-146-263 146 263 146Zm0 384 280-155v-312L480-456 200-610v312l280 155Zm0-384Z" />
  </svg>
);
const IconNoTicket = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    height="24"
    viewBox="0 -960 960 960"
    width="24"
    fill="currentColor"
  >
    <path d="M560-440q-42 0-71-29t-29-71q0-42 29-71t71-29q42 0 71 29t29 71q0 42-29 71t-71 29ZM280-320q-33 0-56.5-23.5T200-400v-320q0-33 23.5-56.5T280-800h560q33 0 56.5 23.5T920-720v320q0 33-23.5 56.5T840-320H280Zm80-80h400q0-33 23.5-56.5T840-480v-160q-33 0-56.5-23.5T760-720H360q0 33-23.5 56.5T280-640v160q33 0 56.5 23.5T360-400Zm-240 240q-33 0-56.5-23.5T40-240v-440h80v440h680v80H120Zm160-400Z" />
  </svg>
);

const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("dashboard");
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [chartData, setChartData] = useState<SalesChartPoint[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [orderTotal, setOrderTotal] = useState(0);
  const [orderPage, setOrderPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [stocks, setStocks] = useState<TicketStock[]>([]);

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

  const STAT_CARDS = [
    {
      label: "Total Revenue",
      value: formatRupiah(stats?.totalRevenue ?? 0),
      icon: <IconRevenue />,
      color: "text-emerald-600 bg-emerald-50",
    },
    {
      label: "Total Orders",
      value: stats?.totalOrders ?? 0,
      icon: <IconOrders />,
      color: "text-blue-600 bg-blue-50",
    },
    {
      label: "Paid Orders",
      value: stats?.paidOrders ?? 0,
      icon: <IconPaid />,
      color: "text-green-600 bg-green-50",
    },
    {
      label: "Tickets Sold",
      value: stats?.totalTicketsSold ?? 0,
      icon: <IconTicket />,
      color: "text-purple-600 bg-purple-50",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f5f5f5] pt-[72px]">
      <Header
        onContactClick={() => navigate("/")}
        onBookClick={() => navigate("/book-ticket")}
      />

      <div className="max-w-[1200px] mx-auto px-5 md:px-8 py-10">
        {/* Page Title */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-sm text-[#666] hover:text-[#1a1a1a] mb-4 transition-colors"
          >
            ← Kembali ke Home
          </button>
          <h1 className="text-3xl font-bold text-[#1a1a1a]">Admin Panel</h1>
          <p className="text-sm text-[#999] mt-1">
            Beach Boys — 60 Years of Pet Sounds
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          {(
            [
              { key: "dashboard", label: "Dashboard" },
              { key: "orders", label: "Orders" },
              { key: "stocks", label: "Ticket Stock" },
            ] as { key: Tab; label: string }[]
          ).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                tab === key
                  ? "bg-[#1a1a1a] text-white"
                  : "bg-white text-[#666] hover:bg-[#f0f0f0]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ── DASHBOARD ── */}
        {tab === "dashboard" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {STAT_CARDS.map((card) => (
                <div
                  key={card.label}
                  className="bg-white rounded-2xl shadow-sm p-6"
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${card.color}`}
                  >
                    {card.icon}
                  </div>
                  <div className="text-2xl font-bold text-[#1a1a1a]">
                    {card.value}
                  </div>
                  <div className="text-sm text-[#999] mt-1">{card.label}</div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="font-bold text-[#1a1a1a] text-lg mb-1">
                Sales — Last 30 Days
              </h2>
              <p className="text-xs text-[#999] mb-6">
                Revenue (left) & Orders count (right)
              </p>
              {chartData.length === 0 ? (
                <div className="flex items-center justify-center h-48 text-[#999] text-sm">
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
                          stopColor="#1a1a1a"
                          stopOpacity={0.15}
                        />
                        <stop
                          offset="95%"
                          stopColor="#1a1a1a"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 11, fill: "#999" }}
                      tickFormatter={(v: string) => v.slice(5)}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      yAxisId="left"
                      tick={{ fontSize: 11, fill: "#999" }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v: number) =>
                        v >= 1000000
                          ? `${(v / 1000000).toFixed(1)}M`
                          : `${(v / 1000).toFixed(0)}K`
                      }
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      tick={{ fontSize: 11, fill: "#999" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "12px",
                        border: "none",
                        boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                        fontSize: "12px",
                      }}
                      formatter={(val, name) => [
                        name === "revenue" ? formatRupiah(Number(val)) : val,
                        name as string,
                      ]}
                    />
                    <Legend
                      wrapperStyle={{ fontSize: "12px", color: "#666" }}
                    />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="revenue"
                      stroke="#1a1a1a"
                      fill="url(#gradRevenue)"
                      strokeWidth={2}
                      name="revenue"
                    />
                    <Area
                      yAxisId="right"
                      type="monotone"
                      dataKey="orders"
                      stroke="#fee505"
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

        {/* ── ORDERS ── */}
        {tab === "orders" && (
          <div className="space-y-4">
            <div className="flex gap-2 flex-wrap items-center">
              {["", "pending", "paid", "failed", "expired"].map((s) => (
                <button
                  key={s || "all"}
                  onClick={() => {
                    setStatusFilter(s);
                    setOrderPage(1);
                  }}
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all capitalize ${
                    statusFilter === s
                      ? "bg-[#1a1a1a] text-white"
                      : "bg-white text-[#666] hover:bg-[#f0f0f0]"
                  }`}
                >
                  {s || "All"}
                </button>
              ))}
              <span className="ml-auto text-sm text-[#999]">
                {orderTotal} orders
              </span>
            </div>

            <div className="bg-white rounded-2xl shadow-sm overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#f0f0f0]">
                    {[
                      "Order Code",
                      "Customer",
                      "Items",
                      "Total",
                      "Status",
                      "Date",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-5 py-4 text-left text-xs font-semibold text-[#999] uppercase tracking-wider"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-16 text-[#999]">
                        <div className="flex justify-center mb-3 text-[#ccc]">
                          <IconBox />
                        </div>
                        <p className="text-sm">No orders found.</p>
                      </td>
                    </tr>
                  )}
                  {orders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-[#f5f5f5] last:border-0 hover:bg-[#fafafa] transition-colors"
                    >
                      <td className="px-5 py-4 font-mono text-xs text-[#1a1a1a] font-bold">
                        {order.orderCode}
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-semibold text-[#1a1a1a] text-sm">
                          {order.customerName}
                        </div>
                        <div className="text-[#999] text-xs mt-0.5">
                          {order.customerEmail}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-[#666] text-xs space-y-1">
                        {order.items?.map((item, i) => (
                          <div key={i}>
                            {item.quantity}× {item.section} ({item.type})
                          </div>
                        ))}
                      </td>
                      <td className="px-5 py-4 font-bold text-[#1a1a1a]">
                        {formatRupiah(order.totalAmount)}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[order.status] ?? "bg-gray-100 text-gray-500"}`}
                        >
                          {STATUS_LABEL[order.status] ?? order.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-[#999] text-xs">
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

            <div className="flex gap-2 justify-end items-center">
              <button
                onClick={() => setOrderPage((p) => Math.max(1, p - 1))}
                disabled={orderPage === 1}
                className="px-5 py-2 rounded-full text-sm font-semibold bg-white text-[#666] disabled:opacity-40 hover:bg-[#f0f0f0] transition-all"
              >
                ← Prev
              </button>
              <span className="text-sm text-[#999] px-2">Page {orderPage}</span>
              <button
                onClick={() => setOrderPage((p) => p + 1)}
                disabled={orders.length < 20}
                className="px-5 py-2 rounded-full text-sm font-semibold bg-white text-[#666] disabled:opacity-40 hover:bg-[#f0f0f0] transition-all"
              >
                Next →
              </button>
            </div>
          </div>
        )}

        {/* ── TICKET STOCK ── */}
        {tab === "stocks" && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#f0f0f0]">
                  {["Section", "Type", "Stock", "Price"].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-4 text-left text-xs font-semibold text-[#999] uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stocks.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center py-16 text-[#999]">
                      <div className="flex justify-center mb-3 text-[#ccc]">
                        <IconNoTicket />
                      </div>
                      <p className="text-sm">No stocks configured yet.</p>
                    </td>
                  </tr>
                )}
                {stocks.map((s) => (
                  <tr
                    key={s.id}
                    className="border-b border-[#f5f5f5] last:border-0 hover:bg-[#fafafa] transition-colors"
                  >
                    <td className="px-5 py-4 font-bold text-[#1a1a1a]">
                      {s.section}
                    </td>
                    <td className="px-5 py-4 text-[#666] capitalize">
                      {s.type}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`font-bold ${
                          s.stock === 0
                            ? "text-red-500"
                            : s.stock < 10
                              ? "text-yellow-500"
                              : "text-[#1a1a1a]"
                        }`}
                      >
                        {s.stock}
                        {s.stock === 0 && (
                          <span className="ml-2 text-xs bg-red-100 text-red-500 px-2 py-0.5 rounded-full font-semibold">
                            Habis
                          </span>
                        )}
                        {s.stock > 0 && s.stock < 10 && (
                          <span className="ml-2 text-xs bg-yellow-100 text-yellow-600 px-2 py-0.5 rounded-full font-semibold">
                            Hampir habis
                          </span>
                        )}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-semibold text-[#1a1a1a]">
                      {formatRupiah(s.price)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
