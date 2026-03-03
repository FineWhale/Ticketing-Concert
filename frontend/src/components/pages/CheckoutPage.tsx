import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "../organisms";
import { useCart } from "../../context";

type CheckoutStep = "summary" | "form" | "success";

const TYPE_BADGE: Record<string, string> = {
  VIP: "bg-yellow-100 text-yellow-700",
  Premium: "bg-blue-100 text-blue-700",
  Regular: "bg-orange-100 text-orange-700",
  General: "bg-gray-100 text-gray-600",
};

const STEPS: CheckoutStep[] = ["summary", "form", "success"];

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { cart, totalPrice, totalItems, clearCart } = useCart();

  const [step, setStep] = useState<CheckoutStep>("summary");
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [orderId, setOrderId] = useState(`BBK-${Date.now()}`);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (cart.length === 0 && step === "summary") {
      navigate("/book-ticket");
    }
  }, [cart, step, navigate]);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("http://localhost:5000/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          customerName: form.name,
          customerEmail: form.email,
          customerPhone: form.phone,
          items: cart.map((item) => ({
            section: item.section,
            type: item.type,
            quantity: item.quantity,
            priceEach: item.priceEach,
          })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create order");
      }

      const data = await response.json();
      setOrderId(data.orderCode);

      // ← BARU: buka Midtrans Snap popup
      (window as any).snap.pay(data.snapToken, {
        onSuccess: () => {
          clearCart();
          setStep("success");
        },
        onPending: () => {
          clearCart();
          setStep("success");
        },
        onError: () => {
          alert("Pembayaran gagal, silakan coba lagi.");
        },
        onClose: () => {
          alert("Pembayaran dibatalkan.");
        },
      });
    } catch (error: any) {
      console.error("Error creating order:", error);
      alert(`Gagal membuat order: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const stepIndex = STEPS.indexOf(step);

  return (
    <div className="min-h-screen bg-[#f5f5f5] pt-[72px]">
      <Header
        onContactClick={() => navigate("/")}
        onBookClick={() => navigate("/book-ticket")}
      />

      <div className="max-w-lg mx-auto py-10 px-4">
        {/* BACK BUTTON */}
        <button
          onClick={() =>
            step === "summary"
              ? navigate("/book-ticket")
              : setStep(STEPS[stepIndex - 1])
          }
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors"
        >
          ← {step === "summary" ? "Kembali ke pemilihan tiket" : "Kembali"}
        </button>

        {/* PROGRESS BAR */}
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <React.Fragment key={s}>
              <div
                className={`flex items-center gap-1.5 ${step === s ? "text-gray-900" : "text-gray-400"}`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                    step === s
                      ? "bg-gray-900 text-white border-gray-900"
                      : stepIndex > i
                        ? "bg-green-500 text-white border-green-500"
                        : "border-gray-300 text-gray-400"
                  }`}
                >
                  {stepIndex > i ? "✓" : i + 1}
                </div>
                <span className="text-xs font-medium hidden sm:block capitalize">
                  {s}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-0.5 ${stepIndex > i ? "bg-green-500" : "bg-gray-200"}`}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* SUMMARY */}
        {step === "summary" && (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              Ringkasan Pesanan
            </h2>
            <p className="text-sm text-gray-400 mb-6">
              The Beach Boys · 17 Aug 2026 · GBK Jakarta
            </p>

            <div className="space-y-3 mb-6">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
                >
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      Section {item.section}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${TYPE_BADGE[item.type]}`}
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

            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <div className="flex justify-between text-sm text-gray-500 mb-1">
                <span>Subtotal ({totalItems} tiket)</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500 mb-3">
                <span>Biaya layanan</span>
                <span>Gratis</span>
              </div>
              <div className="flex justify-between text-base font-bold text-gray-900 border-t border-gray-200 pt-3">
                <span>Total</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
            </div>

            <button
              onClick={() => setStep("form")}
              className="w-full py-3 bg-gray-900 text-white rounded-full font-bold text-sm hover:bg-gray-700 transition-colors"
            >
              Lanjut ke Data Pemesan →
            </button>
          </div>
        )}

        {/* FORM */}
        {step === "form" && (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              Data Pemesan
            </h2>
            <p className="text-sm text-gray-400 mb-6">
              Tiket akan dikirim ke email ini
            </p>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              {[
                {
                  key: "name",
                  label: "Nama Lengkap",
                  type: "text",
                  placeholder: "John Doe",
                },
                {
                  key: "email",
                  label: "Email",
                  type: "email",
                  placeholder: "john@example.com",
                },
                {
                  key: "phone",
                  label: "No. Telepon",
                  type: "tel",
                  placeholder: "08xxxxxxxxxx",
                },
              ].map(({ key, label, type, placeholder }) => (
                <div key={key}>
                  <label className="text-xs font-semibold text-gray-600 block mb-1.5">
                    {label}
                  </label>
                  <input
                    type={type}
                    required
                    placeholder={placeholder}
                    value={form[key as keyof typeof form]}
                    onChange={(e) =>
                      setForm({ ...form, [key]: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition"
                  />
                </div>
              ))}

              <div className="bg-gray-50 rounded-xl p-3 flex justify-between items-center">
                <span className="text-xs text-gray-500">
                  {totalItems} tiket · {cart.map((i) => i.section).join(", ")}
                </span>
                <span className="text-sm font-bold text-gray-900">
                  {formatPrice(totalPrice)}
                </span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gray-900 text-white rounded-full font-bold text-sm hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Memproses..." : "Lanjut ke Pembayaran →"}
              </button>
            </form>
          </div>
        )}

        {/* SUCCESS */}
        {step === "success" && (
          <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl text-green-600">✓</span>
            </div>

            <h2 className="text-xl font-bold text-gray-900 mb-1">
              Pembayaran Berhasil!
            </h2>
            <p className="text-sm text-gray-400 mb-6">
              Tiket dikirim ke{" "}
              <span className="font-semibold text-gray-700">{form.email}</span>
            </p>

            <div className="bg-gray-900 text-white rounded-2xl p-5 mb-6 text-left">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-xs text-gray-400 mb-1">
                    THE BEACH BOYS CONCERT
                  </p>
                  <p className="text-lg font-bold">60 Years of Pet Sounds</p>
                </div>
                <span className="text-2xl">🎵</span>
              </div>
              <div className="border-t border-gray-700 pt-4 grid grid-cols-2 gap-3 text-left">
                {[
                  { label: "TANGGAL", value: "17 Aug 2026" },
                  { label: "WAKTU", value: "19:00 WIB" },
                  { label: "VENUE", value: "GBK Jakarta" },
                  {
                    label: "SECTION",
                    value: cart.map((i) => i.section).join(", "),
                  },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-[10px] text-gray-400">{label}</p>
                    <p className="text-sm font-semibold">{value}</p>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-700 pt-4 mt-4">
                <p className="text-[10px] text-gray-400 mb-1">ORDER ID</p>
                <p className="text-sm font-mono">{orderId}</p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => navigate("/orders")}
                className="w-full py-3 bg-gray-900 text-white rounded-full font-bold text-sm hover:bg-gray-700 transition-colors"
              >
                🎫 Lihat Tiket Saya
              </button>
              <button
                onClick={() => navigate("/")}
                className="w-full py-3 border-2 border-gray-200 text-gray-600 rounded-full font-semibold text-sm hover:border-gray-400 transition-colors"
              >
                Kembali ke Home
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutPage;
