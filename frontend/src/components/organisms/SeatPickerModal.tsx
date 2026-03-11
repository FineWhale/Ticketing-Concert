import React, { useEffect, useState } from "react";
import { CurvedSeatGrid } from "./CurvedSeatGrid";
import type { Seat } from "./types";

type BlockID = "i" | "j" | "k" | "l";

const BLOCK_LABEL: Record<BlockID, string> = {
  i: "CAT 2 — Block I",
  j: "CAT 2 — Block J",
  k: "CAT 4 — Block K",
  l: "CAT 4 — Block L",
};

const BLOCK_SECTION: Record<BlockID, "CAT2" | "CAT4"> = {
  i: "CAT2",
  j: "CAT2",
  k: "CAT4",
  l: "CAT4",
};

interface Props {
  block: BlockID;
  onConfirm: (selectedSeats: Seat[]) => void;
  onClose: () => void;
}

export const SeatPickerModal: React.FC<Props> = ({
  block,
  onConfirm,
  onClose,
}) => {
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    fetch(`http://localhost:5000/api/seats?block=${block}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
            ? data.data
            : [];
        setSeats(list);
      })
      .finally(() => setLoading(false));
  }, [block]);

  const toggle = (seat: Seat) => {
    if (seat.status !== "available") return;
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(seat.id) ? next.delete(seat.id) : next.add(seat.id);
      return next;
    });
  };

  const selectedSeats = seats.filter((s) => selected.has(s.id));

  // Close on backdrop click
  const onBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-center bg-black/50 px-4 pt-[80px] pb-4"
      onClick={onBackdropClick}
    >
      <div className="bg-white rounded-2xl w-full max-w-xl h-full max-h-[calc(100vh-96px)] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-[#1a1a1a]">
              {BLOCK_LABEL[block]}
            </h2>
            <p className="text-xs text-[#999] mt-0.5">
              {selected.size} kursi dipilih
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-[#999] hover:text-[#1a1a1a] w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-all"
          >
            ✕
          </button>
        </div>

        {/* Legend */}
        <div className="flex gap-4 px-6 py-3 border-b border-gray-100 shrink-0">
          {[
            { color: "bg-white border border-gray-300", label: "Available" },
            {
              color: "bg-[#fee505] border border-[#fee505]",
              label: "Selected",
            },
            { color: "bg-gray-200 border border-gray-200", label: "Taken" },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-1.5">
              <div className={`w-4 h-4 rounded-sm ${color}`} />
              <span className="text-xs text-[#666]">{label}</span>
            </div>
          ))}
        </div>

        {/* Seat grid */}
        <div className="flex-1 overflow-y-auto px-4 py-4 min-h-0">
          {loading ? (
            <div className="flex items-center justify-center h-full text-[#999] text-sm">
              Loading seats...
            </div>
          ) : seats.length === 0 ? (
            <div className="flex items-center justify-center h-full text-[#999] text-sm">
              Tidak ada data kursi.
            </div>
          ) : (
            <CurvedSeatGrid
              seats={seats}
              selected={selected}
              onToggle={toggle}
              section={BLOCK_SECTION[block]}
            />
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between shrink-0">
          <div className="text-sm text-[#666] flex-1 mr-4 truncate">
            {selected.size > 0 ? (
              <span>
                Dipilih:{" "}
                <span className="font-bold text-[#1a1a1a]">
                  {selectedSeats
                    .map((s) => `${s.block.toUpperCase()}${s.row}${s.number}`)
                    .join(", ")}
                </span>
              </span>
            ) : (
              "Belum ada kursi dipilih"
            )}
          </div>
          <button
            onClick={() => {
              if (selected.size > 0) onConfirm(selectedSeats);
            }}
            disabled={selected.size === 0}
            className="shrink-0 px-6 py-2.5 bg-[#1a1a1a] text-white rounded-full text-sm font-semibold disabled:opacity-40 hover:bg-[#333] transition-all"
          >
            Konfirmasi {selected.size > 0 ? `(${selected.size})` : ""}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SeatPickerModal;
