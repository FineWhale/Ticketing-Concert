import React, { useEffect, useRef, useState } from "react";
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
const TYPE_BADGE: Record<string, string> = {
  VIP: "bg-yellow-100 text-yellow-700",
  Premium: "bg-blue-100 text-blue-700",
  Regular: "bg-orange-100 text-orange-700",
  General: "bg-gray-100 text-gray-600",
};

const SEAT_SECTIONS = new Set(["CAT 2 I", "CAT 2 J", "CAT 4 K", "CAT 4 L"]);

const formatRupiah = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(n);

/* ── Icons ── */
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
const IconEdit = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    height="16"
    viewBox="0 -960 960 960"
    width="16"
    fill="currentColor"
  >
    <path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z" />
  </svg>
);
const IconCheck = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    height="16"
    viewBox="0 -960 960 960"
    width="16"
    fill="currentColor"
  >
    <path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z" />
  </svg>
);
const IconClose = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    height="16"
    viewBox="0 -960 960 960"
    width="16"
    fill="currentColor"
  >
    <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" />
  </svg>
);

/* ── Inline Edit Cell ── */
interface EditCellProps {
  value: number;
  disabled?: boolean;
  onSave: (val: number) => Promise<void>;
}
const EditCell: React.FC<EditCellProps> = ({ value, disabled, onSave }) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.select();
  }, [editing]);

  const handleSave = async () => {
    const num = Number(draft);
    if (isNaN(num) || num < 0) return;
    setSaving(true);
    await onSave(num);
    setSaving(false);
    setEditing(false);
  };

  if (disabled)
    return (
      <span className="text-xs text-[#aaa] italic">auto (dari seats)</span>
    );

  if (!editing)
    return (
      <div className="flex items-center gap-2 group">
        <span className="font-semibold text-[#1a1a1a]">{value}</span>
        <button
          onClick={() => {
            setDraft(String(value));
            setEditing(true);
          }}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-[#f0f0f0] text-[#999]"
        >
          <IconEdit />
        </button>
      </div>
    );

  return (
    <div className="flex items-center gap-1.5">
      <input
        ref={inputRef}
        type="number"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSave();
          if (e.key === "Escape") setEditing(false);
        }}
        className="w-28 px-2 py-1 text-sm border-2 border-[#1a1a1a] rounded-lg focus:outline-none font-semibold"
      />
      <button
        onClick={handleSave}
        disabled={saving}
        className="p-1.5 rounded-lg bg-[#1a1a1a] text-white hover:bg-[#333] disabled:opacity-50 transition-colors"
      >
        <IconCheck />
      </button>
      <button
        onClick={() => setEditing(false)}
        className="p-1.5 rounded-lg bg-[#f0f0f0] text-[#666] hover:bg-[#e0e0e0] transition-colors"
      >
        <IconClose />
      </button>
    </div>
  );
};

/* ── Main Page ── */
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
  const [saveError, setSaveError] = useState("");

  const API_BASE =
    process.env.REACT_APP_API_BASE_URL || "http://localhost:5000/api";
  const token = localStorage.getItem("token") ?? "";

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

  const handleUpdateStock = async (id: string, stock: number) => {
    setSaveError("");
    const res = await fetch(`${API_BASE}/admin/ticket-stocks/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ stock }),
    });
    if (!res.ok) {
      setSaveError("Gagal update stock.");
      return;
    }
    setStocks((prev) => prev.map((s) => (s.id === id ? { ...s, stock } : s)));
  };

  const handleUpdatePrice = async (id: string, price: number) => {
    setSaveError("");
    const res = await fetch(`${API_BASE}/admin/ticket-stocks/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ price }),
    });
    if (!res.ok) {
      setSaveError("Gagal update price.");
      return;
    }
    setStocks((prev) => prev.map((s) => (s.id === id ? { ...s, price } : s)));
  };

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

  const groupedStocks = stocks.reduce<Record<string, TicketStock[]>>(
    (acc, s) => {
      const cat = s.section.split(" ").slice(0, 2).join(" ");
      (acc[cat] ??= []).push(s);
      return acc;
    },
    {},
  );

  return (
    <div className="min-h-screen bg-[#f5f5f5] pt-[72px]">
      <Header
        onContactClick={() => navigate("/")}
        onBookClick={() => navigate("/book-ticket")}
      />

      <div className="max-w-[1200px] mx-auto px-5 md:px-8 py-10">
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
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${tab === key ? "bg-[#1a1a1a] text-white" : "bg-white text-[#666] hover:bg-[#f0f0f0]"}`}
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
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all capitalize ${statusFilter === s ? "bg-[#1a1a1a] text-white" : "bg-white text-[#666] hover:bg-[#f0f0f0]"}`}
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
                      <td className="px-5 py-4 font-mono text-xs font-bold">
                        {order.orderCode}
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-semibold text-sm">
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
                      <td className="px-5 py-4 font-bold">
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
          <div className="space-y-4">
            <div className="flex items-center gap-4 flex-wrap">
              <p className="text-sm text-[#666]">
                Hover pada kolom{" "}
                <span className="font-semibold text-[#1a1a1a]">Stock</span> atau{" "}
                <span className="font-semibold text-[#1a1a1a]">Price</span> lalu
                klik ✏️ untuk edit.
              </p>
              <div className="flex items-center gap-3 ml-auto text-xs text-[#999]">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-400 inline-block" />{" "}
                  Habis
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" />{" "}
                  {"< 10"}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />{" "}
                  Tersedia
                </span>
              </div>
            </div>

            {saveError && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
                {saveError}
              </div>
            )}

            {stocks.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm flex flex-col items-center justify-center py-24 text-[#999]">
                <div className="text-[#ccc] mb-3">
                  <IconNoTicket />
                </div>
                <p className="text-sm">No stocks configured yet.</p>
              </div>
            ) : (
              Object.entries(groupedStocks).map(([cat, items]) => (
                <div
                  key={cat}
                  className="bg-white rounded-2xl shadow-sm overflow-hidden"
                >
                  {/* Category header */}
                  <div className="px-6 py-3 bg-[#fafafa] border-b border-[#f0f0f0] flex items-center gap-3">
                    <span className="text-xs font-bold text-[#1a1a1a] uppercase tracking-widest">
                      {cat}
                    </span>
                    <span className="text-xs text-[#999]">
                      {items.length} section
                    </span>
                    <span className="ml-auto text-xs text-[#999]">
                      Total stok:{" "}
                      <span className="font-bold text-[#1a1a1a]">
                        {items.reduce((s, i) => s + i.stock, 0)}
                      </span>
                    </span>
                  </div>

                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#f0f0f0]">
                        {["Section", "Type", "Stock", "Price", "Status"].map(
                          (h) => (
                            <th
                              key={h}
                              className="px-6 py-3 text-left text-xs font-semibold text-[#999] uppercase tracking-wider"
                            >
                              {h}
                            </th>
                          ),
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((s) => {
                        const isSeatBased = SEAT_SECTIONS.has(s.section);
                        const stockStatus =
                          s.stock === 0 ? "empty" : s.stock < 10 ? "low" : "ok";
                        return (
                          <tr
                            key={s.id}
                            className="border-b border-[#f5f5f5] last:border-0 hover:bg-[#fafafa] transition-colors"
                          >
                            <td className="px-6 py-4">
                              <span className="font-bold text-[#1a1a1a]">
                                {s.section}
                              </span>
                              {isSeatBased && (
                                <span className="ml-2 text-[10px] bg-blue-50 text-blue-500 px-1.5 py-0.5 rounded-full font-semibold">
                                  seat-based
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`text-xs font-semibold px-2.5 py-1 rounded-full ${TYPE_BADGE[s.type] ?? "bg-gray-100 text-gray-600"}`}
                              >
                                {s.type}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`w-2 h-2 rounded-full flex-shrink-0 ${stockStatus === "empty" ? "bg-red-400" : stockStatus === "low" ? "bg-yellow-400" : "bg-green-400"}`}
                                />
                                <EditCell
                                  value={s.stock}
                                  disabled={isSeatBased}
                                  onSave={(val) => handleUpdateStock(s.id, val)}
                                />
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <EditCell
                                value={s.price}
                                onSave={(val) => handleUpdatePrice(s.id, val)}
                              />
                            </td>
                            <td className="px-6 py-4">
                              {stockStatus === "empty" ? (
                                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-600">
                                  Habis
                                </span>
                              ) : stockStatus === "low" ? (
                                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
                                  Hampir Habis
                                </span>
                              ) : (
                                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                                  Tersedia
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
