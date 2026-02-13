import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

interface TicketListing {
  id: string;
  section: string;
  row: string;
  type: string;
  priceEach: number;
}

const MOCK_LISTINGS: TicketListing[] = [
  { id: "1", section: "P2-504", row: "Row O", type: "Preventa Banamex", priceEach: 967.25 },
  { id: "2", section: "P2-504", row: "Row P", type: "Preventa Banamex", priceEach: 967.25 },
  { id: "3", section: "P2-504", row: "Row Q", type: "Preventa Banamex", priceEach: 967.25 },
  { id: "4", section: "P2-505", row: "Row N", type: "General Sale", priceEach: 1100 },
  { id: "5", section: "P2-505", row: "Row O", type: "General Sale", priceEach: 1100 },
  { id: "6", section: "CAT 1 A", row: "Row A", type: "VIP", priceEach: 2500000 },
  { id: "7", section: "CAT 1 B", row: "Row B", type: "VIP", priceEach: 2500000 },
  { id: "8", section: "CAT 2 I", row: "Row K", type: "Premium", priceEach: 1500000 },
];

export const TicketPanel: React.FC = () => {
  const navigate = useNavigate();
  const [sortTab, setSortTab] = useState<"lowest" | "best">("lowest");
  const [ticketCount, setTicketCount] = useState("2");
  const [priceFilter, setPriceFilter] = useState("All Prices");
  const [typeFilter, setTypeFilter] = useState("All Ticket Types");

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(price);

  return (
    <div className="flex flex-col h-full min-h-0">
      <p className="text-sm text-[#666] mb-3">144 results for:</p>

      <div className="flex flex-wrap gap-2 mb-4">
        <select
          className="px-3 py-2 border border-[#e0e0e0] rounded-md bg-white text-sm text-[#1a1a1a] cursor-pointer min-w-[100px]"
          value={ticketCount}
          onChange={(e) => setTicketCount(e.target.value)}
          aria-label="Jumlah tiket"
        >
          <option value="1">1 Ticket</option>
          <option value="2">2 Tickets</option>
          <option value="3">3 Tickets</option>
          <option value="4">4 Tickets</option>
        </select>
        <select
          className="px-3 py-2 border border-[#e0e0e0] rounded-md bg-white text-sm text-[#1a1a1a] cursor-pointer min-w-[100px]"
          value={priceFilter}
          onChange={(e) => setPriceFilter(e.target.value)}
          aria-label="Filter harga"
        >
          <option value="All Prices">All Prices</option>
          <option value="Under 1M">Under Rp 1.000.000</option>
          <option value="1M-2M">Rp 1.000.000 - 2.000.000</option>
          <option value="Over 2M">Over Rp 2.000.000</option>
        </select>
        <select
          className="px-3 py-2 border border-[#e0e0e0] rounded-md bg-white text-sm text-[#1a1a1a] cursor-pointer min-w-[100px]"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          aria-label="Tipe tiket"
        >
          <option value="All Ticket Types">All Ticket Types</option>
          <option value="VIP">VIP</option>
          <option value="Premium">Premium</option>
          <option value="General">General</option>
        </select>
      </div>

      <div className="flex gap-0 mb-4 border-b border-[#e0e0e0]">
        <button
          type="button"
          className={`px-4 py-[10px] bg-transparent border-none text-sm font-medium cursor-pointer border-b-2 mb-[-1px] transition-colors ${
            sortTab === "lowest" 
              ? "text-blue-600 border-b-blue-600" 
              : "text-[#666] border-b-transparent"
          }`}
          onClick={() => setSortTab("lowest")}
        >
          Lowest Price
        </button>
        <button
          type="button"
          className={`px-4 py-[10px] bg-transparent border-none text-sm font-medium cursor-pointer border-b-2 mb-[-1px] transition-colors ${
            sortTab === "best" 
              ? "text-blue-600 border-b-blue-600" 
              : "text-[#666] border-b-transparent"
          }`}
          onClick={() => setSortTab("best")}
        >
          Best Seats
        </button>
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col gap-0 mb-5">
        {MOCK_LISTINGS.map((item) => (
          <div 
            key={item.id} 
            className="flex items-center gap-3 py-[14px] border-b border-[#e8e8e8] cursor-pointer transition-colors hover:bg-[#f8f8f8]" 
            role="button" 
            tabIndex={0}
          >
            <span className="text-lg text-[#999] flex-shrink-0" aria-hidden>◀</span>
            <div className="flex-1 flex flex-col gap-0.5">
              <span className="text-sm font-semibold text-[#1a1a1a]">
                Section {item.section} {item.row}
              </span>
              <span className="text-[13px] text-blue-600">{item.type}</span>
              <span className="text-[13px] text-blue-600">{formatPrice(item.priceEach)} each</span>
            </div>
            <span className="text-lg text-[#999] flex-shrink-0" aria-hidden>›</span>
          </div>
        ))}
      </div>

      <button 
        type="button" 
        className="w-full px-6 py-[14px] bg-yellow text-[#1a1a1a] border-none rounded-full text-base font-bold cursor-pointer transition-[filter] hover:brightness-95" 
        onClick={() => navigate("/login")}
      >
        Book Ticket
      </button>
    </div>
  );
};
