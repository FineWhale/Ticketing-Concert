import React, {
  useRef,
  useState,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import type { Seat } from "./types";

interface Props {
  seats: Seat[];
  selected: Set<string>;
  onToggle: (seat: Seat) => void;
  section: "CAT2" | "CAT4";
}

const CONFIGS: Record<
  string,
  { ir: number; rs: number; s: number; e: number; cx: number; cy: number }
> = {
  i: { ir: 300, rs: 20, s: 110, e: 170, cx: 560, cy: -100 },
  j: { ir: 300, rs: 20, s: 10, e: 70, cx: -20, cy: -100 },
  k: { ir: 240, rs: 22, s: 108, e: 172, cx: 480, cy: -80 },
  l: { ir: 240, rs: 22, s: 8, e: 72, cx: -20, cy: -80 },
};

const SECTION_COLOR: Record<string, string> = {
  CAT2: "#a0a0b0",
  CAT4: "#4ade80",
};

const MIN_SCALE = 0.15;
const MAX_SCALE = 4;
const SEAT_R = 7;

function getSeatPos(
  rowIdx: number,
  seatIdx: number,
  total: number,
  ir: number,
  rs: number,
  startDeg: number,
  endDeg: number,
  cx: number,
  cy: number,
) {
  const r = ir + rowIdx * rs;
  const start = (startDeg * Math.PI) / 180;
  const end = (endDeg * Math.PI) / 180;
  const t = total <= 1 ? 0.5 : seatIdx / (total - 1);
  const angle = start + t * (end - start);
  return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle), r, angle };
}

function computeGeometry(seats: Seat[], cfg: (typeof CONFIGS)[string]) {
  const rows = seats.reduce<Record<string, Seat[]>>((acc, seat) => {
    (acc[seat.row] ??= []).push(seat);
    return acc;
  }, {});
  const sortedRows = Object.entries(rows).sort(([a], [b]) =>
    a.localeCompare(b),
  );

  // Kumpulkan semua posisi kursi beserta r dan angle-nya
  type PtInfo = { x: number; y: number; r: number; angle: number };
  const allPts: PtInfo[] = [];
  sortedRows.forEach(([, rowSeats], ri) => {
    const sorted = [...rowSeats].sort((a, b) => a.number - b.number);
    sorted.forEach((_, si) =>
      allPts.push(
        getSeatPos(
          ri,
          si,
          sorted.length,
          cfg.ir,
          cfg.rs,
          cfg.s,
          cfg.e,
          cfg.cx,
          cfg.cy,
        ),
      ),
    );
  });

  // Hitung bounding box dari posisi kursi (sudah include radius)
  const pad = SEAT_R + 8;
  const xs = allPts.map((p) => p.x);
  const ys = allPts.map((p) => p.y);
  const minX = Math.min(...xs) - pad;
  const minY = Math.min(...ys) - pad;
  const maxX = Math.max(...xs) + pad;
  const maxY = Math.max(...ys) + pad;

  // Arc: hitung dari radius baris pertama dan terakhir + padding kursi
  const firstRowR = cfg.ir;
  const lastRowR = cfg.ir + (sortedRows.length - 1) * cfg.rs;
  const innerR = firstRowR - (SEAT_R + 6);
  const outerR = lastRowR + (SEAT_R + 6);

  // Sudut: hitung dari kursi paling kiri dan kanan baris tengah
  const midRowIdx = Math.floor(sortedRows.length / 2);
  const [, midRowSeats] = sortedRows[midRowIdx];
  const midSorted = [...midRowSeats].sort((a, b) => a.number - b.number);
  const firstPt = getSeatPos(
    midRowIdx,
    0,
    midSorted.length,
    cfg.ir,
    cfg.rs,
    cfg.s,
    cfg.e,
    cfg.cx,
    cfg.cy,
  );
  const lastPt = getSeatPos(
    midRowIdx,
    midSorted.length - 1,
    midSorted.length,
    cfg.ir,
    cfg.rs,
    cfg.s,
    cfg.e,
    cfg.cx,
    cfg.cy,
  );

  const angularPad = Math.asin((SEAT_R + 4) / firstPt.r);
  const startAngle = firstPt.angle - angularPad;
  const endAngle = lastPt.angle + angularPad;

  const arcPath = [
    `M ${cfg.cx + outerR * Math.cos(startAngle)} ${cfg.cy + outerR * Math.sin(startAngle)}`,
    `A ${outerR} ${outerR} 0 0 1 ${cfg.cx + outerR * Math.cos(endAngle)} ${cfg.cy + outerR * Math.sin(endAngle)}`,
    `L ${cfg.cx + innerR * Math.cos(endAngle)} ${cfg.cy + innerR * Math.sin(endAngle)}`,
    `A ${innerR} ${innerR} 0 0 0 ${cfg.cx + innerR * Math.cos(startAngle)} ${cfg.cy + innerR * Math.sin(startAngle)}`,
    "Z",
  ].join(" ");

  return {
    sortedRows,
    originX: (minX + maxX) / 2,
    originY: (minY + maxY) / 2,
    bboxW: maxX - minX,
    bboxH: maxY - minY,
    arcPath,
  };
}

export const CurvedSeatGrid: React.FC<Props> = ({
  seats,
  selected,
  onToggle,
  section,
}) => {
  const accentColor = SECTION_COLOR[section] ?? "#9ca3af";
  const containerRef = useRef<HTMLDivElement>(null);
  const didDrag = useRef(false);
  const dragRef = useRef<{
    startX: number;
    startY: number;
    startOX: number;
    startOY: number;
  } | null>(null);
  const pinchRef = useRef<{ dist: number; scale: number } | null>(null);

  const [containerSize, setContainerSize] = useState({ w: 520, h: 380 });
  const [scale, setScale] = useState(0.5);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const block = seats[0]?.block;
  const cfg = block ? CONFIGS[block] : null;

  const geo = useMemo(() => {
    if (!cfg || seats.length === 0) return null;
    return computeGeometry(seats, cfg);
  }, [seats, cfg]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || !geo) return;
    let first = true;
    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setContainerSize({ w: width, h: height });
      if (first) {
        first = false;
        const fs = Math.min(width / geo.bboxW, height / geo.bboxH) * 0.88;
        setScale(fs);
        setOffset({ x: 0, y: 0 });
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [geo]);

  const fitScale = useMemo(() => {
    if (!geo) return 0.5;
    return (
      Math.min(containerSize.w / geo.bboxW, containerSize.h / geo.bboxH) * 0.88
    );
  }, [geo, containerSize]);

  const resetView = useCallback(() => {
    setScale(fitScale);
    setOffset({ x: 0, y: 0 });
  }, [fitScale]);

  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setScale((s) =>
      Math.min(MAX_SCALE, Math.max(MIN_SCALE, s * (e.deltaY > 0 ? 0.9 : 1.1))),
    );
  }, []);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      didDrag.current = false;
      dragRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        startOX: offset.x,
        startOY: offset.y,
      };
    },
    [offset],
  );

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) didDrag.current = true;
    setOffset({
      x: dragRef.current.startOX + dx,
      y: dragRef.current.startOY + dy,
    });
  }, []);

  const onPointerUp = useCallback(() => {
    dragRef.current = null;
  }, []);

  const onTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length !== 2) return;
      e.preventDefault();
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (!pinchRef.current) {
        pinchRef.current = { dist, scale };
        return;
      }
      setScale(
        Math.min(
          MAX_SCALE,
          Math.max(
            MIN_SCALE,
            pinchRef.current.scale * (dist / pinchRef.current.dist),
          ),
        ),
      );
    },
    [scale],
  );

  const onTouchEnd = useCallback(() => {
    pinchRef.current = null;
  }, []);

  if (!cfg || !geo) return null;

  const pivotX = containerSize.w / 2 + offset.x;
  const pivotY = containerSize.h / 2 + offset.y;
  const transform = `translate(${pivotX},${pivotY}) scale(${scale}) translate(${-geo.originX},${-geo.originY})`;

  return (
    <div className="flex flex-col items-center gap-2 w-full">
      <div className="bg-[#1a1a1a] text-white text-[10px] font-bold px-8 py-1.5 rounded-full tracking-widest">
        STAGE
      </div>
      <p className="text-[10px] text-[#bbb]">
        Scroll/pinch untuk zoom · drag untuk geser
      </p>

      <div
        ref={containerRef}
        className="relative w-full rounded-xl bg-[#fafafa] border border-gray-100"
        style={{
          height: 380,
          overflow: "hidden",
          cursor: dragRef.current ? "grabbing" : "grab",
          touchAction: "none",
        }}
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <svg width="100%" height="100%">
          <g transform={transform}>
            <path d={geo.arcPath} fill={accentColor} opacity={0.1} />
            <path
              d={geo.arcPath}
              fill="none"
              stroke={accentColor}
              strokeWidth={2}
              opacity={0.3}
            />

            {geo.sortedRows.map(([rowLabel, rowSeats], rowIdx) => {
              const sorted = [...rowSeats].sort((a, b) => a.number - b.number);
              return sorted.map((seat, seatIdx) => {
                const { x, y } = getSeatPos(
                  rowIdx,
                  seatIdx,
                  sorted.length,
                  cfg.ir,
                  cfg.rs,
                  cfg.s,
                  cfg.e,
                  cfg.cx,
                  cfg.cy,
                );
                const isAvail = seat.status === "available";
                const isSel = selected.has(seat.id);
                return (
                  <circle
                    key={seat.id}
                    cx={x}
                    cy={y}
                    r={SEAT_R}
                    fill={isSel ? "#fee505" : isAvail ? "#fff" : "#e5e7eb"}
                    stroke={
                      isSel ? "#d4c004" : isAvail ? accentColor : "#d1d5db"
                    }
                    strokeWidth={isSel ? 2.5 : 1.5}
                    opacity={!isAvail ? 0.4 : 1}
                    style={{
                      cursor: isAvail ? "pointer" : "not-allowed",
                      pointerEvents: "all",
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!didDrag.current && isAvail) onToggle(seat);
                    }}
                  >
                    <title>{`${block!.toUpperCase()}${rowLabel}${seat.number}`}</title>
                  </circle>
                );
              });
            })}
          </g>
        </svg>

        <div
          className="absolute bottom-3 left-3 flex flex-col gap-1 z-10"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => setScale((s) => Math.min(MAX_SCALE, s * 1.25))}
            className="w-7 h-7 bg-white border border-gray-200 rounded-full text-gray-600 font-bold shadow-sm hover:bg-gray-50 flex items-center justify-center text-base leading-none"
          >
            +
          </button>
          <button
            onClick={() => setScale((s) => Math.max(MIN_SCALE, s * 0.8))}
            className="w-7 h-7 bg-white border border-gray-200 rounded-full text-gray-600 font-bold shadow-sm hover:bg-gray-50 flex items-center justify-center text-base leading-none"
          >
            −
          </button>
        </div>

        <div
          className="absolute bottom-3 right-3 z-10"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <button
            onClick={resetView}
            className="bg-white border border-gray-200 text-[11px] text-gray-500 px-2.5 py-1 rounded-full shadow-sm hover:bg-gray-50 transition-all"
          >
            Reset view
          </button>
        </div>
      </div>
    </div>
  );
};
