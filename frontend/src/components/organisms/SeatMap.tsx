import React, { useState, useEffect, useRef, useCallback } from "react";

export interface SeatSection {
  id: string;
  // img: string;
  label: string;
  price: number;
  available: number;
  gridArea: string;
}

const CONTAINER_MAX_WIDTH = "640px";

const SEAT_SECTIONS: SeatSection[] = [
  {
    id: "cat1_a",
    // img: "/images/cat1_A.png",
    label: "CAT 1 A",
    price: 2500000,
    available: 42,
    gridArea: "a",
  },
  {
    id: "cat1_b",
    // img: "/images/cat1_B.png",
    label: "CAT 1 B",
    price: 2500000,
    available: 38,
    gridArea: "b",
  },
  {
    id: "cat1_c",
    // img: "/images/cat1_C.png",
    label: "CAT 1 C",
    price: 2500000,
    available: 55,
    gridArea: "c",
  },
  {
    id: "cat1_d",
    // img: "/images/cat1_D.png",
    label: "CAT 1 D",
    price: 2500000,
    available: 40,
    gridArea: "d",
  },
  {
    id: "cat1_e",
    // img: "/images/cat1_E.png",
    label: "CAT 1 E",
    price: 2500000,
    available: 45,
    gridArea: "e",
  },
  {
    id: "cat1_f",
    // img: "/images/cat1_F.png",
    label: "CAT 1 F",
    price: 2500000,
    available: 52,
    gridArea: "f",
  },
  {
    id: "cat3_g",
    // img: "/images/cat3_G.png",
    label: "CAT 3 G",
    price: 1200000,
    available: 80,
    gridArea: "g",
  },
  {
    id: "cat3_h",
    // img: "/images/cat3_H.png",
    label: "CAT 3 H",
    price: 1200000,
    available: 78,
    gridArea: "h",
  },
  {
    id: "cat2_i",
    // img: "/images/cat2_I.png",
    label: "CAT 2 I",
    price: 1500000,
    available: 120,
    gridArea: "i",
  },
  {
    id: "cat2_j",
    // img: "/images/cat2_J.png",
    label: "CAT 2 J",
    price: 1500000,
    available: 115,
    gridArea: "j",
  },
  {
    id: "cat4_k",
    // img: "/images/cat4_K.png",
    label: "CAT 4 K",
    price: 750000,
    available: 200,
    gridArea: "k",
  },
  {
    id: "cat4_l",
    // img: "/images/cat4_L.png",
    label: "CAT 4 L",
    price: 750000,
    available: 195,
    gridArea: "l",
  },
];

const SECTION_BY_AREA = Object.fromEntries(
  SEAT_SECTIONS.map((s) => [s.gridArea, s]),
);

interface HoverCardState {
  section: SeatSection;
  x: number;
  y: number;
}

export const SeatMap: React.FC = () => {
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const [hoverCard, setHoverCard] = useState<HoverCardState | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`${process.env.PUBLIC_URL || ""}/images/Panggung_1.svg`)
      .then((r) => r.text())
      .then(setSvgContent)
      .catch(() => setSvgContent(null));
  }, []);

  useEffect(() => {
    if (!svgContent || !containerRef.current) return;
    const container = containerRef.current;

    const updateCardFromEvent = (e: MouseEvent) => {
      const target = (e.target as Element).closest?.('[id^="seat-"]');
      if (!target || !(target as HTMLElement).id) return;
      const id = (target as HTMLElement).id;
      const area = id.replace(/^seat-/, "");
      if (area === "stage") return;
      const section = SECTION_BY_AREA[area];
      if (section) setHoverCard({ section, x: e.clientX, y: e.clientY });
    };

    const onOver = (e: MouseEvent) => updateCardFromEvent(e);
    const onMove = (e: MouseEvent) => updateCardFromEvent(e);
    const onLeave = () => setHoverCard(null);

    container.addEventListener("mouseover", onOver);
    container.addEventListener("mousemove", onMove);
    container.addEventListener("mouseleave", onLeave);
    return () => {
      container.removeEventListener("mouseover", onOver);
      container.removeEventListener("mousemove", onMove);
      container.removeEventListener("mouseleave", onLeave);
    };
  }, [svgContent]);

  const formatPrice = useCallback(
    (price: number) =>
      new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
      }).format(price),
    [],
  );

  return (
    <div
      className="relative w-full mx-auto"
      style={{ maxWidth: CONTAINER_MAX_WIDTH }}
    >
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-4 items-center">
          <button
            type="button"
            className="inline-flex items-center gap-2 px-[14px] py-2 bg-white border border-[#e0e0e0] rounded-full text-sm text-[#1a1a1a] cursor-pointer"
            aria-pressed="true"
          >
            <span className="w-2 h-2 rounded-full bg-green-600" /> General
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 px-[14px] py-2 bg-white border border-[#e0e0e0] rounded-full text-sm text-[#1a1a1a] cursor-pointer"
            aria-pressed="true"
          >
            <span className="w-2 h-2 rounded-full bg-[#95cca3]" /> Regular
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 px-[14px] py-2 bg-white border border-[#e0e0e0] rounded-full text-sm text-[#1a1a1a] cursor-pointer"
            aria-pressed="true"
          >
            <span className="w-2 h-2 rounded-full bg-[#c0c0c0]" /> Premium
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 px-[14px] py-2 bg-white border border-[#e0e0e0] rounded-full text-sm text-[#1a1a1a] cursor-pointer"
            aria-pressed="true"
          >
            <span className="w-2 h-2 rounded-full bg-[#efff5e]" /> VIP
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
        ref={containerRef}
        className="seat-map-svg w-full overflow-hidden rounded-[2px] bg-white [&_[id^=seat-]]:cursor-pointer [&_[id^=seat-]]:transition-[filter] [&_[id^=seat-]:hover]:brightness-105"
        style={{ aspectRatio: "884 / 477" }}
        role="img"
        aria-label="Peta kursi konser"
      >
        {svgContent && (
          <div
            className="w-full h-full [&_svg]:w-full [&_svg]:h-full [&_svg]:block"
            dangerouslySetInnerHTML={{ __html: svgContent }}
          />
        )}
      </div>

      {hoverCard && (
        <div
          className="fixed translate-x-3 translate-y-3 w-[180px] p-[12px_14px] bg-white rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.15)] border border-[#e0e0e0] z-[1000] pointer-events-none"
          style={{ left: hoverCard.x, top: hoverCard.y }}
          role="tooltip"
        >
          <div className="text-sm font-bold text-[#1a1a1a] block mb-1">
            {hoverCard.section.label}
          </div>
          <div className="text-[15px] font-semibold text-primary block mb-0.5">
            {formatPrice(hoverCard.section.price)}
          </div>
          <div className="text-xs text-[#666]">
            {hoverCard.section.available} kursi tersedia
          </div>
        </div>
      )}
    </div>
  );
};
