import React, { useState, useCallback } from "react";

export interface SeatSection {
  id: string;
  img: string;
  label: string;
  price: number;
  available: number;
  gridArea: string;
}

// ===== KONFIGURASI SEAT MAP =====
// Grid columns: lebar setiap kolom (7 kolom total)
// Format: [kolom1, kolom2, kolom3, aisle, kolom5, kolom6, kolom7]
const GRID_COLUMNS = "1fr 1fr 1.5fr 0.2fr 1.5fr 1fr 1fr";

// Grid rows: tinggi setiap baris (5 baris: stage + 4 baris seat)
const GRID_ROWS = "auto 2fr 2fr 3fr 4fr";

// Gap: jarak antar cell [vertical horizontal]
const GRID_GAP = "0px 1px";

// Grid template areas: posisi setiap section
// Setiap baris = 1 row, setiap huruf = 1 kolom
// "." = kolom kosong (aisle)
// Huruf yang sama = section yang span beberapa kolom
// Untuk geser CAT 2 (i, j) atau CAT 3 (g, h), edit baris yang sesuai di bawah:
const GRID_AREAS = `
  "stage stage stage stage stage stage stage"
  "g a b . d e h"
  ". c c . f f ."
  ". i i . j j ."
  ". k k . l l ."
`;

// Container size
const CONTAINER_MAX_WIDTH = "640px"; // max-width container
const CONTAINER_ASPECT_RATIO = "1.3 / 1"; // proporsi container (width/height)
const CONTAINER_MAX_HEIGHT = "500px"; // max-height container

// Image scaling
const IMAGE_OBJECT_FIT = "contain"; // "contain" | "cover" | "fill" | "scale-down"
// ===== END KONFIGURASI =====

const SEAT_SECTIONS: SeatSection[] = [
  { id: "cat1_a", img: "/images/cat1_A.png", label: "CAT 1 A", price: 2500000, available: 42, gridArea: "a" },
  { id: "cat1_b", img: "/images/cat1_B.png", label: "CAT 1 B", price: 2500000, available: 38, gridArea: "b" },
  { id: "cat1_c", img: "/images/cat1_C.png", label: "CAT 1 C", price: 2500000, available: 55, gridArea: "c" },
  { id: "cat1_d", img: "/images/cat1_D.png", label: "CAT 1 D", price: 2500000, available: 40, gridArea: "d" },
  { id: "cat1_e", img: "/images/cat1_E.png", label: "CAT 1 E", price: 2500000, available: 45, gridArea: "e" },
  { id: "cat1_f", img: "/images/cat1_F.png", label: "CAT 1 F", price: 2500000, available: 52, gridArea: "f" },
  { id: "cat3_g", img: "/images/cat3_G.png", label: "CAT 3 G", price: 1200000, available: 80, gridArea: "g" },
  { id: "cat3_h", img: "/images/cat3_H.png", label: "CAT 3 H", price: 1200000, available: 78, gridArea: "h" },
  { id: "cat2_i", img: "/images/cat2_I.png", label: "CAT 2 I", price: 1500000, available: 120, gridArea: "i" },
  { id: "cat2_j", img: "/images/cat2_J.png", label: "CAT 2 J", price: 1500000, available: 115, gridArea: "j" },
  { id: "cat4_k", img: "/images/cat4_K.png", label: "CAT 4 K", price: 750000, available: 200, gridArea: "k" },
  { id: "cat4_l", img: "/images/cat4_L.png", label: "CAT 4 L", price: 750000, available: 195, gridArea: "l" },
];

interface HoverCardState {
  section: SeatSection;
  x: number;
  y: number;
}

export const SeatMap: React.FC = () => {
  const [hoverCard, setHoverCard] = useState<HoverCardState | null>(null);

  const handleMouseEnter = useCallback(
    (section: SeatSection) => (e: React.MouseEvent) => {
      setHoverCard({ section, x: e.clientX, y: e.clientY });
    },
    []
  );

  const handleMouseMove = useCallback(
    (section: SeatSection) => (e: React.MouseEvent) => {
      if (hoverCard?.section.id === section.id) {
        setHoverCard((prev) => (prev ? { ...prev, x: e.clientX, y: e.clientY } : null));
      }
    },
    [hoverCard?.section.id]
  );

  const handleMouseLeave = useCallback(() => {
    setHoverCard(null);
  }, []);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(price);

  return (
    <div className="relative w-full mx-auto" style={{ maxWidth: CONTAINER_MAX_WIDTH }}>
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-4 items-center">
          <button 
            type="button" 
            className="inline-flex items-center gap-2 px-[14px] py-2 bg-white border border-[#e0e0e0] rounded-full text-sm text-[#1a1a1a] cursor-pointer"
            aria-pressed="true"
          >
            <span className="w-2 h-2 rounded-full bg-blue-600" /> Standard
          </button>
          <button 
            type="button" 
            className="inline-flex items-center gap-2 px-[14px] py-2 bg-white border border-[#e0e0e0] rounded-full text-sm text-[#1a1a1a] cursor-pointer"
            aria-pressed="false"
          >
            <span className="w-2 h-2 rounded-full bg-[#c0c0c0]" /> Accessible <span className="ml-1 text-xs text-[#666]">1</span>
          </button>
        </div>
        <div className="flex flex-col gap-1">
          <button 
            type="button" 
            className="w-8 h-8 border border-[#e0e0e0] rounded-full bg-white text-base cursor-pointer flex items-center justify-center hover:bg-[#f0f0f0]" 
            aria-label="Refresh"
          >
            ↻
          </button>
          <button 
            type="button" 
            className="w-8 h-8 border border-[#e0e0e0] rounded-full bg-white text-base cursor-pointer flex items-center justify-center hover:bg-[#f0f0f0]" 
            aria-label="Zoom in"
          >
            +
          </button>
          <button 
            type="button" 
            className="w-8 h-8 border border-[#e0e0e0] rounded-full bg-white text-base cursor-pointer flex items-center justify-center hover:bg-[#f0f0f0]" 
            aria-label="Zoom out"
          >
            −
          </button>
        </div>
      </div>

      <div
        className="grid w-full items-stretch justify-items-stretch"
        style={{
          gridTemplateColumns: GRID_COLUMNS,
          gridTemplateRows: GRID_ROWS,
          gap: GRID_GAP,
          gridTemplateAreas: GRID_AREAS,
          aspectRatio: CONTAINER_ASPECT_RATIO,
          maxHeight: CONTAINER_MAX_HEIGHT,
        }}
        role="img"
        aria-label="Peta kursi konser"
      >
        <div className="bg-yellow text-[#1a1a1a] font-bold text-base flex items-center justify-center p-[10px] rounded">
          Stage
        </div>

        {SEAT_SECTIONS.map((section) => (
          <div
            key={section.id}
            className="relative overflow-hidden rounded-[2px] cursor-pointer m-0 p-0"
            style={{ gridArea: section.gridArea }}
            onMouseEnter={handleMouseEnter(section)}
            onMouseMove={handleMouseMove(section)}
            onMouseLeave={handleMouseLeave}
          >
            <img 
              src={section.img} 
              alt={section.label} 
              className="w-full h-full object-contain object-center block pointer-events-none transition-[filter] duration-150 ease-in-out hover:brightness-105" 
              draggable={false} 
            />
          </div>
        ))}
      </div>

      {hoverCard && (
        <div
          className="fixed translate-x-3 translate-y-3 w-[180px] p-[12px_14px] bg-white rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.15)] border border-[#e0e0e0] z-[1000] pointer-events-none"
          style={{ left: hoverCard.x, top: hoverCard.y }}
          role="tooltip"
        >
          <div className="text-sm font-bold text-[#1a1a1a] block mb-1">{hoverCard.section.label}</div>
          <div className="text-[15px] font-semibold text-primary block mb-0.5">{formatPrice(hoverCard.section.price)}</div>
          <div className="text-xs text-[#666]">{hoverCard.section.available} kursi tersedia</div>
        </div>
      )}
    </div>
  );
};
