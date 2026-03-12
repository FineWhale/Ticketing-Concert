import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import { Header } from "../organisms";

interface OrderItem {
  id: string;
  section: string;
  type: string;
  quantity: number;
  priceEach: number;
}

interface Order {
  id: string;
  orderCode: string;
  totalAmount: number;
  status: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  createdAt: string;
  items: OrderItem[];
  snapToken: string;
  paymentUrl: string;
}

const STATUS_STYLE: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  paid: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-600",
  expired: "bg-gray-100 text-gray-500",
};
const STATUS_LABEL: Record<string, string> = {
  pending: "Menunggu Pembayaran",
  paid: "Lunas",
  failed: "Gagal",
  expired: "Kedaluwarsa",
};
const TYPE_BADGE: Record<string, string> = {
  VIP: "bg-yellow-100 text-yellow-700",
  Premium: "bg-blue-100 text-blue-700",
  Regular: "bg-orange-100 text-orange-700",
  General: "bg-gray-100 text-gray-600",
};

const API_BASE = "http://localhost:5000/api";

/* ── QR Component ── */
const TicketQR: React.FC<{ orderCode: string; customerName: string }> = ({
  orderCode,
  customerName,
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleDownload = () => {
    const canvas = canvasRef.current?.querySelector("canvas");
    if (!canvas) return;

    // Buat canvas baru dengan padding + label di bawah
    const pad = 24;
    const labelH = 52;
    const size = canvas.width;
    const out = document.createElement("canvas");
    out.width = size + pad * 2;
    out.height = size + pad * 2 + labelH;
    const ctx = out.getContext("2d")!;

    // Background putih
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, out.width, out.height);

    // QR
    ctx.drawImage(canvas, pad, pad);

    // Label order code
    ctx.fillStyle = "#1a1a1a";
    ctx.font = "bold 13px monospace";
    ctx.textAlign = "center";
    ctx.fillText(orderCode, out.width / 2, size + pad * 2 + 18);

    // Label nama
    ctx.fillStyle = "#999";
    ctx.font = "11px sans-serif";
    ctx.fillText(customerName, out.width / 2, size + pad * 2 + 36);

    const link = document.createElement("a");
    link.download = `tiket-${orderCode}.png`;
    link.href = out.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="flex flex-col items-center gap-3 py-4">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
        QR Tiket — Tunjukkan di Venue
      </p>

      {/* QR wrapper dengan border dekoratif */}
      <div className="relative p-3 rounded-2xl border-2 border-dashed border-gray-200 bg-white shadow-sm">
        {/* Corner dots */}
        {[
          "top-2 left-2",
          "top-2 right-2",
          "bottom-2 left-2",
          "bottom-2 right-2",
        ].map((pos) => (
          <span
            key={pos}
            className={`absolute w-2.5 h-2.5 rounded-full bg-[#1a1a1a] ${pos}`}
          />
        ))}
        <div ref={canvasRef}>
          <QRCodeCanvas
            value={orderCode}
            size={180}
            bgColor="#ffffff"
            fgColor="#1a1a1a"
            level="H"
            includeMargin={false}
          />
        </div>
      </div>

      <p className="text-[11px] font-mono font-bold text-gray-700 tracking-widest">
        {orderCode}
      </p>

      <button
        onClick={handleDownload}
        className="flex items-center gap-2 px-5 py-2 bg-[#1a1a1a] text-white rounded-full text-xs font-semibold hover:bg-[#333] transition-colors"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="14"
          viewBox="0 -960 960 960"
          width="14"
          fill="currentColor"
        >
          <path d="M480-320 280-520l56-58 104 104v-326h80v326l104-104 56 58-200 200ZM240-160q-33 0-56.5-23.5T160-240v-120h80v120h480v-120h80v120q0 33-23.5 56.5T720-160H240Z" />
        </svg>
        Download QR
      </button>

      <p className="text-[10px] text-gray-400 text-center max-w-[200px]">
        Simpan atau screenshot QR ini. Akan di-scan oleh petugas saat masuk
        venue.
      </p>
    </div>
  );
};

/* ── Main Page ── */
const OrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [syncingOrder, setSyncingOrder] = useState<string | null>(null);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const getToken = () => localStorage.getItem("authToken");

  const fetchOrders = async () => {
    const token = getToken();
    if (!token) {
      navigate("/login");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 401) {
        navigate("/login");
        return;
      }
      if (!response.ok) throw new Error("Gagal mengambil data orders");
      const data = await response.json();
      setOrders(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const syncStatus = async (orderCode: string): Promise<string> => {
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/orders/${orderCode}/sync-status`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return "pending";
      const data = await res.json();
      const newStatus = data.status ?? "pending";
      setOrders((prev) =>
        prev.map((o) =>
          o.orderCode === orderCode ? { ...o, status: newStatus } : o,
        ),
      );
      return newStatus;
    } catch {
      return "pending";
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [navigate]);

  useEffect(() => {
    if (orders.length === 0) return;
    orders
      .filter((o) => o.status === "pending")
      .forEach((o) => syncStatus(o.orderCode));
  }, [orders.length]); // eslint-disable-line

  const toggleExpand = (orderCode: string) => {
    setExpandedOrder(expandedOrder === orderCode ? null : orderCode);
  };

  const handleContinuePayment = (order: Order) => {
    if (!(window as any).snap) {
      alert("Midtrans Snap belum siap, coba refresh halaman.");
      return;
    }
    (window as any).snap.pay(order.snapToken, {
      onSuccess: async () => {
        await syncStatus(order.orderCode);
      },
      onPending: async () => {
        await syncStatus(order.orderCode);
      },
      onError: async () => {
        await syncStatus(order.orderCode);
        alert("Pembayaran gagal, silakan coba lagi.");
      },
      onClose: async () => {
        setSyncingOrder(order.orderCode);
        await syncStatus(order.orderCode);
        setSyncingOrder(null);
      },
    });
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] pt-[72px]">
      <Header
        onContactClick={() => navigate("/")}
        onBookClick={() => navigate("/book-ticket")}
      />

      <div className="max-w-lg mx-auto py-10 px-4">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors"
        >
          ← Kembali ke Home
        </button>

        <div className="flex items-center justify-between mb-1">
          <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
          <button
            onClick={() => fetchOrders()}
            className="text-xs text-gray-400 hover:text-gray-700 transition-colors"
          >
            ⟲
          </button>
        </div>
        <p className="text-sm text-gray-400 mb-6">
          Riwayat pembelian tiket kamu
        </p>

        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl shadow-sm p-6 animate-pulse"
              >
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
                <div className="h-3 bg-gray-100 rounded w-1/2 mb-2" />
                <div className="h-3 bg-gray-100 rounded w-1/4" />
              </div>
            ))}
          </div>
        )}

        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
            <p className="text-red-500 font-medium mb-3">{error}</p>
            <button
              onClick={() => fetchOrders()}
              className="px-4 py-2 bg-gray-900 text-white rounded-full text-sm font-semibold"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {!loading && !error && orders.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-10 text-center">
            <div className="text-5xl mb-4">🎫</div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              Belum Ada Order
            </h3>
            <p className="text-sm text-gray-400 mb-6">
              Kamu belum pernah membeli tiket. Yuk, book sekarang!
            </p>
            <button
              onClick={() => navigate("/book-ticket")}
              className="px-6 py-3 bg-gray-900 text-white rounded-full font-bold text-sm hover:bg-gray-700 transition-colors"
            >
              Book Ticket →
            </button>
          </div>
        )}

        {!loading && !error && orders.length > 0 && (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.orderCode}
                className="bg-white rounded-2xl shadow-sm overflow-hidden"
              >
                {/* HEADER */}
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">Order ID</p>
                      <p className="text-sm font-mono font-bold text-gray-900">
                        {order.orderCode}
                      </p>
                    </div>
                    <span
                      className={`text-[11px] font-semibold px-3 py-1 rounded-full ${STATUS_STYLE[order.status] || "bg-gray-100 text-gray-500"}`}
                    >
                      {syncingOrder === order.orderCode
                        ? "Mengecek..."
                        : STATUS_LABEL[order.status] || order.status}
                    </span>
                  </div>

                  <div className="bg-gray-100 text-black rounded-xl p-4 mb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">
                          The Beach Boys Concert
                        </p>
                        <p className="text-sm font-bold">
                          60 Years of Pet Sounds
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          17 Aug 2026 · GBK Jakarta
                        </p>
                      </div>
                      <span className="text-xl">🎵</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {order.items?.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-1">
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${TYPE_BADGE[item.type] || "bg-gray-100 text-gray-500"}`}
                        >
                          {item.type}
                        </span>
                        <span className="text-[10px] text-gray-500">
                          {item.section} ×{item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-400">
                      {formatDate(order.createdAt)}
                    </p>
                    <p className="text-base font-bold text-gray-900">
                      {formatPrice(order.totalAmount)}
                    </p>
                  </div>

                  {order.status === "pending" && order.snapToken && (
                    <button
                      onClick={() => handleContinuePayment(order)}
                      className="mt-3 w-full py-2.5 bg-[#fee505] text-gray-900 rounded-full text-sm font-bold hover:brightness-95 transition-all"
                    >
                      Lanjutkan Pembayaran
                    </button>
                  )}
                </div>

                {/* EXPAND BUTTON */}
                <button
                  onClick={() => toggleExpand(order.orderCode)}
                  className="w-full py-3 border-t border-gray-100 text-xs font-semibold text-gray-500 hover:text-gray-800 hover:bg-gray-50 transition-colors"
                >
                  {expandedOrder === order.orderCode
                    ? "▲ Sembunyikan Detail"
                    : "▼ Lihat Detail Tiket"}
                </button>

                {/* EXPANDED DETAIL */}
                {expandedOrder === order.orderCode && (
                  <div className="border-t border-gray-100 px-5 pb-5 pt-4">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                      Detail Tiket
                    </p>
                    <div className="space-y-3 mb-4">
                      {order.items?.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0"
                        >
                          <div>
                            <p className="text-sm font-semibold text-gray-900">
                              Section {item.section}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span
                                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${TYPE_BADGE[item.type] || "bg-gray-100 text-gray-500"}`}
                              >
                                {item.type}
                              </span>
                              <span className="text-xs text-gray-400">
                                {item.quantity} tiket
                              </span>
                            </div>
                          </div>
                          <p className="text-sm font-bold text-gray-900">
                            {formatPrice(item.priceEach * item.quantity)}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* QR CODE — hanya muncul jika sudah paid */}
                    {order.status === "paid" && (
                      <div className="border border-gray-100 rounded-2xl mb-4 bg-gray-50">
                        <TicketQR
                          orderCode={order.orderCode}
                          customerName={order.customerName}
                        />
                      </div>
                    )}

                    {/* INFO PEMESAN */}
                    <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        Info Pemesan
                      </p>
                      {[
                        { label: "Nama", value: order.customerName },
                        { label: "Email", value: order.customerEmail },
                        { label: "Telepon", value: order.customerPhone },
                      ].map(({ label, value }) => (
                        <div
                          key={label}
                          className="flex justify-between text-sm"
                        >
                          <span className="text-gray-500">{label}</span>
                          <span className="font-medium text-gray-800">
                            {value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
