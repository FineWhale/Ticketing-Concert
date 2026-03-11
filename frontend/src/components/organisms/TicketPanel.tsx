import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCartContext } from "../../context/CartContext";
import { SeatPickerModal } from "./SeatPickerModal";
import type { Seat } from "./types";

type BlockID = "i" | "j" | "k" | "l";

const SECTION_TO_BLOCK: Record<string, BlockID> = {
  "CAT 2 I": "i",
  "CAT 2 J": "j",
  "CAT 4 K": "k",
  "CAT 4 L": "l",
};

interface TicketListing {
  id: string;
  section: string;
  type: string;
  priceEach: number;
  available: number;
  block?: BlockID;
}

const TYPE_BADGE: Record<string, string> = {
  VIP: "bg-yellow-100 text-yellow-700",
  Premium: "bg-blue-100 text-blue-700",
  Regular: "bg-orange-100 text-orange-700",
  General: "bg-gray-100 text-gray-600",
};

const API_BASE =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:5000/api";

export const TicketPanel: React.FC = () => {
  const navigate = useNavigate();
  const { cart, addItem, decreaseItem, removeItem, totalItems, totalPrice } =
    useCartContext();

  const [listings, setListings] = useState<TicketListing[]>([]);
  const [loadingListings, setLoadingListings] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [sortTab, setSortTab] = useState<"lowest" | "best">("lowest");
  const [priceFilter, setPriceFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [pickerBlock, setPickerBlock] = useState<BlockID | null>(null);

  const fetchStocks = async () => {
    setLoadingListings(true);
    setFetchError("");
    try {
      const res = await fetch(`${API_BASE}/ticket-stocks`);
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const json = await res.json();
      const raw: {
        id: string;
        section: string;
        type: string;
        stock: number;
        price: number;
      }[] = json.data ?? json;

      const mapped: TicketListing[] = raw
        .filter((s) => s.stock > 0)
        .map((s) => ({
          id: s.id,
          section: s.section,
          type: s.type,
          priceEach: s.price,
          available: s.stock,
          block: SECTION_TO_BLOCK[s.section],
        }));

      setListings(mapped);
    } catch (err: any) {
      console.error("Failed to load ticket stocks:", err);
      setFetchError("Gagal memuat tiket. Coba refresh halaman.");
    } finally {
      setLoadingListings(false);
    }
  };

  useEffect(() => {
    fetchStocks();
  }, []);

  const formatPrice = (p: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(p);

  const standingKey = (item: TicketListing) => `${item.section}-${item.type}`;

  const getStandingCart = (item: TicketListing) =>
    cart.find((i) => i.id === standingKey(item));

  const getSeatedCarts = (item: TicketListing) =>
    cart.filter(
      (i) =>
        i.section === item.section &&
        i.type === item.type &&
        i.seatIds.length > 0,
    );

  const getQty = (item: TicketListing): number => {
    if (item.block) {
      return getSeatedCarts(item).reduce((sum, i) => sum + i.quantity, 0);
    }
    return getStandingCart(item)?.quantity ?? 0;
  };

  const getExistingSeatIds = (block: BlockID): string[] => {
    const listing = listings.find((l) => l.block === block);
    if (!listing) return [];
    return getSeatedCarts(listing).flatMap((i) => i.seatIds);
  };

  const handleSeatConfirm = (block: BlockID, selectedSeats: Seat[]) => {
    const listing = listings.find((l) => l.block === block);
    if (!listing || selectedSeats.length === 0) return;

    const seatIds = selectedSeats.map((s) => s.id);
    const seatLabels = selectedSeats.map(
      (s) => `${s.block.toUpperCase()}${s.row}${s.number}`,
    );

    addItem({
      section: listing.section,
      type: listing.type,
      priceEach: listing.priceEach,
      quantity: selectedSeats.length,
      seatIds,
      seatLabels,
    });

    setPickerBlock(null);
  };

  const handleSeatRemove = (item: TicketListing) => {
    const seatedCarts = getSeatedCarts(item);
    if (seatedCarts.length === 0) return;
    const last = seatedCarts[seatedCarts.length - 1];
    removeItem(last.id);
  };

  const filtered = listings
    .filter((t) => {
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

  return (
    <>
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
        <div className="flex mb-4 border-b border-gray-200">
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
          {/* Loading skeleton */}
          {loadingListings && (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="rounded-xl border border-gray-200 bg-white p-4 animate-pulse"
                >
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
                  <div className="h-3 bg-gray-100 rounded w-1/4 mb-4" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                </div>
              ))}
            </div>
          )}

          {/* Error state */}
          {!loadingListings && fetchError && (
            <div className="text-center py-10">
              <p className="text-sm text-red-400 mb-3">{fetchError}</p>
              <button
                onClick={fetchStocks}
                className="px-4 py-2 bg-gray-900 text-white text-xs font-semibold rounded-full hover:bg-gray-700 transition-colors"
              >
                Coba Lagi
              </button>
            </div>
          )}

          {/* Empty state */}
          {!loadingListings && !fetchError && filtered.length === 0 && (
            <p className="text-center text-gray-400 py-10 text-sm">
              Tidak ada tiket tersedia
            </p>
          )}

          {/* Listings */}
          {!loadingListings &&
            !fetchError &&
            filtered.map((item) => {
              const qty = getQty(item);
              const isSeatable = !!item.block;
              const seatedCarts = isSeatable ? getSeatedCarts(item) : [];
              const allLabels = seatedCarts.flatMap((c) => c.seatLabels);

              return (
                <div
                  key={item.id}
                  className={`rounded-xl border transition-all p-4 ${
                    qty > 0
                      ? "border-green-400 bg-green-50 shadow-sm"
                      : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                  }`}
                >
                  {/* Top: name + price */}
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm font-bold text-gray-900">
                        Section {item.section}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${TYPE_BADGE[item.type] ?? "bg-gray-100 text-gray-600"}`}
                        >
                          {item.type}
                        </span>
                        {isSeatable && (
                          <button
                            onClick={() => setPickerBlock(item.block!)}
                            className="text-xs text-blue-500 font-medium hover:underline"
                          >
                            🪑 {qty > 0 ? "Ubah Kursi" : "Pilih Kursi"}
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

                  {/* Seat label chips */}
                  {allLabels.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {allLabels.map((label) => (
                        <span
                          key={label}
                          className="text-[10px] px-1.5 py-0.5 bg-yellow-300 text-gray-900 rounded font-bold"
                        >
                          {label}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Bottom: available + stepper */}
                  <div className="flex items-center justify-between mt-3">
                    <p className="text-xs text-gray-400">
                      {item.available} kursi tersedia
                    </p>

                    {qty === 0 ? (
                      <button
                        onClick={() => {
                          if (isSeatable) setPickerBlock(item.block!);
                          else
                            addItem({
                              section: item.section,
                              type: item.type,
                              priceEach: item.priceEach,
                              quantity: 1,
                              seatIds: [],
                              seatLabels: [],
                            });
                        }}
                        className="px-4 py-1.5 bg-gray-900 text-white text-xs font-semibold rounded-full hover:bg-gray-700 transition-colors"
                      >
                        {isSeatable ? "🪑 Pilih Kursi" : "+ Tambah"}
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            if (isSeatable) handleSeatRemove(item);
                            else decreaseItem(standingKey(item));
                          }}
                          className="w-7 h-7 rounded-full bg-gray-200 text-gray-700 font-bold hover:bg-gray-300 transition-colors flex items-center justify-center text-base leading-none"
                        >
                          −
                        </button>
                        <span className="text-sm font-bold text-gray-900 w-5 text-center">
                          {qty}
                        </span>
                        <button
                          onClick={() => {
                            if (isSeatable) setPickerBlock(item.block!);
                            else
                              addItem({
                                section: item.section,
                                type: item.type,
                                priceEach: item.priceEach,
                                quantity: 1,
                                seatIds: [],
                                seatLabels: [],
                              });
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
            })}
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

      {/* Seat Picker Modal */}
      {pickerBlock && (
        <SeatPickerModal
          block={pickerBlock}
          initialSelected={getExistingSeatIds(pickerBlock)}
          onConfirm={(seats) => handleSeatConfirm(pickerBlock, seats)}
          onClose={() => setPickerBlock(null)}
        />
      )}
    </>
  );
};
