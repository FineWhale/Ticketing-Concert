import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCartContext } from "../../context/CartContext";

type BlockID = "i" | "j" | "k" | "l";

interface TicketPanelProps {
  onOpenSeatPicker?: (block: BlockID) => void;
}

interface TicketListing {
  id: string;
  section: string;
  type: string;
  priceEach: number;
  available: number;
  block?: BlockID;
}

const MOCKLISTINGS: TicketListing[] = [
  {
    id: "cat1a",
    section: "CAT 1 A",
    type: "VIP",
    priceEach: 2500000,
    available: 42,
  },
  {
    id: "cat1b",
    section: "CAT 1 B",
    type: "VIP",
    priceEach: 2500000,
    available: 38,
  },
  {
    id: "cat1c",
    section: "CAT 1 C",
    type: "VIP",
    priceEach: 2500000,
    available: 55,
  },
  {
    id: "cat1d",
    section: "CAT 1 D",
    type: "VIP",
    priceEach: 2500000,
    available: 40,
  },
  {
    id: "cat1e",
    section: "CAT 1 E",
    type: "VIP",
    priceEach: 2500000,
    available: 45,
  },
  {
    id: "cat1f",
    section: "CAT 1 F",
    type: "VIP",
    priceEach: 2500000,
    available: 52,
  },
  {
    id: "cat2i",
    section: "CAT 2 I",
    type: "Premium",
    priceEach: 1500000,
    available: 120,
    block: "i",
  },
  {
    id: "cat2j",
    section: "CAT 2 J",
    type: "Premium",
    priceEach: 1500000,
    available: 115,
    block: "j",
  },
  {
    id: "cat3g",
    section: "CAT 3 G",
    type: "Regular",
    priceEach: 1200000,
    available: 80,
  },
  {
    id: "cat3h",
    section: "CAT 3 H",
    type: "Regular",
    priceEach: 1200000,
    available: 78,
  },
  {
    id: "cat4k",
    section: "CAT 4 K",
    type: "General",
    priceEach: 750000,
    available: 200,
    block: "k",
  },
  {
    id: "cat4l",
    section: "CAT 4 L",
    type: "General",
    priceEach: 750000,
    available: 195,
    block: "l",
  },
];

const TYPE_BADGE: Record<string, string> = {
  VIP: "bg-yellow-100 text-yellow-700",
  Premium: "bg-blue-100 text-blue-700",
  Regular: "bg-orange-100 text-orange-700",
  General: "bg-gray-100 text-gray-600",
};

export const TicketPanel: React.FC<TicketPanelProps> = ({
  onOpenSeatPicker,
}) => {
  const navigate = useNavigate();
  const { cart, addItem, removeItem, totalItems, totalPrice } =
    useCartContext();

  const [sortTab, setSortTab] = useState<"lowest" | "best">("lowest");
  const [priceFilter, setPriceFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);

  const getQty = (id: string) => cart.find((i) => i.id === id)?.quantity ?? 0;
  const getCartItem = (id: string) => cart.find((i) => i.id === id);
  const cartItemById = (item: TicketListing) => getCartItem(item.id);

  const filtered = MOCKLISTINGS.filter((t) => {
    if (priceFilter === "Under 1M") return t.priceEach < 1000000;
    if (priceFilter === "1M-2M")
      return t.priceEach >= 1000000 && t.priceEach <= 2000000;
    if (priceFilter === "Over 2M") return t.priceEach > 2000000;
    return true;
  })
    .filter((t) => typeFilter === "All" || t.type === typeFilter)
    .sort((a, b) =>
      sortTab === "lowest"
        ? a.priceEach - b.priceEach
        : b.available - a.available,
    );

  const handleAdd = (item: TicketListing) => {
    addItem({
      id: item.id,
      section: item.section,
      type: item.type,
      priceEach: item.priceEach,
      quantity: 1,
      seatIds: [],
      seatLabels: [],
    });
  };

  const handleRemove = (item: TicketListing) => {
    removeItem(item.id);
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* FILTERS */}
      <div className="flex flex-wrap gap-2 mb-4">
        <select
          className="px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-500"
          value={priceFilter}
          onChange={(e) => setPriceFilter(e.target.value)}
        >
          <option value="All">Semua Harga</option>
          <option value="Under 1M">Under Rp 1.000.000</option>
          <option value="1M-2M">Rp 1jt - 2jt</option>
          <option value="Over 2M">Over Rp 2.000.000</option>
        </select>
        <select
          className="px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-500"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="All">Semua Tipe</option>
          <option value="VIP">VIP</option>
          <option value="Premium">Premium</option>
          <option value="Regular">Regular</option>
          <option value="General">General</option>
        </select>
      </div>

      {/* SORT TABS */}
      <div className="flex gap-0 mb-4 border-b border-gray-200">
        {(["lowest", "best"] as const).map((tab) => (
          <button
            key={tab}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              sortTab === tab
                ? "text-green-700 border-green-700"
                : "text-gray-400 border-transparent hover:text-gray-600"
            }`}
            onClick={() => setSortTab(tab)}
          >
            {tab === "lowest" ? "Harga Terendah" : "Kursi Terbaik"}
          </button>
        ))}
      </div>

      {/* TICKET LIST */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-3 mb-4 pr-1">
        {filtered.length === 0 ? (
          <p className="text-center text-gray-400 py-10 text-sm">
            Tidak ada tiket tersedia
          </p>
        ) : (
          filtered.map((item) => {
            const qty = getQty(item.id);
            const inCart = cartItemById(item);
            const isSeatable = !!item.block;
            const hasSeats = (inCart?.seatLabels?.length ?? 0) > 0;

            return (
              <div
                key={item.id}
                className={`rounded-xl border transition-all p-4 ${
                  qty > 0
                    ? "border-green-400 bg-green-50 shadow-sm"
                    : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                }`}
              >
                {/* Top row: section name + price */}
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm font-bold text-gray-900">
                      Section {item.section}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full ${TYPE_BADGE[item.type]}`}
                      >
                        {item.type}
                      </span>
                      {isSeatable && (
                        <button
                          onClick={() => onOpenSeatPicker?.(item.block!)}
                          className="text-xs text-blue-500 font-medium hover:underline"
                        >
                          🪑 Pilih Kursi
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <p className="text-base font-bold text-gray-900">
                      {formatPrice(item.priceEach)}
                    </p>
                    <p className="text-xs text-gray-400">per tiket</p>
                  </div>
                </div>

                {/* Seat labels jika ada */}
                {hasSeats && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {inCart!.seatLabels.map((label) => (
                      <span
                        key={label}
                        className="text-[10px] px-1.5 py-0.5 bg-yellow-300 text-gray-900 rounded font-bold"
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                )}

                {/* Bottom row: available + stepper */}
                <div className="flex items-center justify-between mt-3">
                  <p className="text-xs text-gray-400">
                    {item.available} kursi tersedia
                  </p>

                  {/* Stepper — sama untuk seatable maupun tidak */}
                  {qty === 0 ? (
                    <button
                      onClick={() => {
                        // Untuk seatable, buka picker dulu jika belum ada kursi
                        if (isSeatable && !hasSeats) {
                          onOpenSeatPicker?.(item.block!);
                        } else {
                          handleAdd(item);
                        }
                      }}
                      className="px-4 py-1.5 bg-gray-900 text-white text-xs font-semibold rounded-full hover:bg-gray-700 transition-colors"
                    >
                      {isSeatable ? "🪑 Pilih Kursi" : "+ Tambah"}
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleRemove(item)}
                        className="w-7 h-7 rounded-full bg-gray-200 text-gray-700 font-bold hover:bg-gray-300 transition-colors flex items-center justify-center text-base leading-none"
                      >
                        −
                      </button>
                      <span className="text-sm font-bold text-gray-900 w-5 text-center">
                        {qty}
                      </span>
                      <button
                        onClick={() => {
                          // Untuk seatable, buka picker untuk tambah kursi
                          if (isSeatable) {
                            onOpenSeatPicker?.(item.block!);
                          } else {
                            handleAdd(item);
                          }
                        }}
                        disabled={qty >= item.available}
                        className="w-7 h-7 rounded-full bg-gray-900 text-white font-bold hover:bg-gray-700 disabled:opacity-30 transition-colors flex items-center justify-center text-base leading-none"
                      >
                        +
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* CART SUMMARY */}
      {totalItems > 0 && (
        <div className="border-t border-gray-200 pt-3 shrink-0">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm text-gray-600">
              {totalItems} tiket dipilih
            </span>
            <span className="text-base font-bold text-gray-900">
              {formatPrice(totalPrice)}
            </span>
          </div>
          <button
            className="w-full py-3 bg-yellow-400 text-gray-900 rounded-full text-sm font-bold hover:brightness-95 transition-all"
            onClick={() => navigate("/checkout")}
          >
            Checkout →
          </button>
        </div>
      )}
    </div>
  );
};
