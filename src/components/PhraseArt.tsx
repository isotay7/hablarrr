import type { PhraseCategory } from "@/content/types";

// Original card art: one simple emblem per phrase category on a warm color.
// Drawn here from basic shapes, in the spirit of a lotería card but not a copy of any.

const ART: Record<string, { bg: string; fg: string; draw: React.ReactNode }> = {
  saludos: {
    bg: "#E0B13A",
    fg: "#2B1D15",
    draw: (
      <>
        <path d="M10 32a14 14 0 0 1 28 0z" />
        <path d="M24 8v5M10.5 13.5l3.5 3.5M37.5 13.5L34 17M5 26h4M39 26h4" />
        <path d="M6 37h36" />
      </>
    ),
  },
  respeto: {
    bg: "#2F5DA8",
    fg: "#F4F7FF",
    draw: (
      <>
        <path d="M5 31c4 3 34 3 38 0" />
        <path d="M15 30c0-8 2-15 9-15s9 7 9 15" />
        <path d="M17 24h14" />
      </>
    ),
  },
  comida: {
    bg: "#C2432B",
    fg: "#FFF6EA",
    draw: (
      <>
        <path d="M6 22h36" />
        <path d="M9 22a15 15 0 0 0 30 0" />
        <path d="M18 15c0-3 2-3 2-6M26 15c0-3 2-3 2-6" />
        <path d="M17 40h14" />
      </>
    ),
  },
  trabajo: {
    bg: "#3F8A6B",
    fg: "#F2FFF8",
    draw: (
      <>
        <rect x="7" y="16" width="34" height="22" rx="4" />
        <path d="M18 16v-4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v4" />
        <path d="M7 26h34" />
      </>
    ),
  },
  familia: {
    bg: "#B4532F",
    fg: "#FFF6EA",
    draw: (
      <>
        <path d="M7 22L24 9l17 13" />
        <path d="M11 20v19h26V20" />
        <path d="M24 34c-6-4-7-7-5-9s5 0 5 2c0-2 3-4 5-2s1 5-5 9z" />
      </>
    ),
  },
  gracias: {
    bg: "#D9578C",
    fg: "#FFF3F8",
    draw: (
      <path d="M24 39C10 30 6 23 9 16c3-6 11-6 15 1 4-7 12-7 15-1 3 7-1 14-15 23z" />
    ),
  },
  despedidas: {
    bg: "#6B4E8A",
    fg: "#F7F0FF",
    draw: (
      <>
        <path d="M30 9a14 14 0 1 0 9 22A11 11 0 0 1 30 9z" />
        <path d="M14 12l1.2 2.6 2.8.4-2 2 .5 2.8-2.5-1.4-2.5 1.4.5-2.8-2-2 2.8-.4z" />
      </>
    ),
  },
  ayuda: {
    bg: "#4F7BC9",
    fg: "#F4F7FF",
    draw: (
      <>
        <path d="M8 10h32v22H22l-8 7v-7H8z" />
        <path d="M20 17a4 4 0 1 1 5 4c-1 .5-1 1.5-1 2.5" />
        <circle cx="24" cy="28" r="0.8" fill="currentColor" />
      </>
    ),
  },
  direcciones: {
    bg: "#2E7D5B",
    fg: "#F2FFF8",
    draw: (
      <>
        <path d="M24 6v36" />
        <path d="M24 11h13l4 4-4 4H24" />
        <path d="M24 23H11l-4 4 4 4h13" />
        <path d="M18 42h12" />
      </>
    ),
  },
  dinero: {
    bg: "#E8C26A",
    fg: "#2B1D15",
    draw: (
      <>
        <ellipse cx="24" cy="14" rx="13" ry="5" />
        <path d="M11 14v7c0 3 6 5 13 5s13-2 13-5v-7" />
        <path d="M11 21v7c0 3 6 5 13 5s13-2 13-5v-7" />
        <path d="M11 28v7c0 3 6 5 13 5s13-2 13-5v-7" />
      </>
    ),
  },
  hotel: {
    bg: "#7A5C46",
    fg: "#FFF6EA",
    draw: (
      <>
        <circle cx="16" cy="18" r="8" />
        <circle cx="16" cy="18" r="2.5" />
        <path d="M22 23l17 17M33 34l4-4M29 30l3-3" />
      </>
    ),
  },
  transporte: {
    bg: "#E0B13A",
    fg: "#2B1D15",
    draw: (
      <>
        <path d="M6 30v-8l5-9h26l5 9v8z" />
        <path d="M11 22h26" />
        <circle cx="14" cy="32" r="4" />
        <circle cx="34" cy="32" r="4" />
      </>
    ),
  },
  compras: {
    bg: "#D2694A",
    fg: "#FFF6EA",
    draw: (
      <>
        <path d="M8 18h32l-4 20H12z" />
        <path d="M16 18l6-10M32 18l-6-10" />
        <path d="M17 25v7M24 25v7M31 25v7" />
      </>
    ),
  },
  salud: {
    bg: "#3B9AA8",
    fg: "#F2FDFF",
    draw: (
      <>
        <circle cx="24" cy="24" r="16" />
        <path d="M20 14h8v6h6v8h-6v6h-8v-6h-6v-8h6z" />
      </>
    ),
  },
  tiempo: {
    bg: "#2F5DA8",
    fg: "#F4F7FF",
    draw: (
      <>
        <circle cx="24" cy="25" r="15" />
        <path d="M24 16v9l6 4" />
        <path d="M19 6h10" />
      </>
    ),
  },
  charla: {
    bg: "#F2A93B",
    fg: "#2B1D15",
    draw: (
      <>
        <path d="M5 9h22v15H14l-6 5v-5H5z" />
        <path d="M31 17h12v15h-3v5l-6-5H21v-4" />
      </>
    ),
  },
  sentimientos: {
    bg: "#D9578C",
    fg: "#FFF3F8",
    draw: (
      <>
        <circle cx="24" cy="24" r="16" />
        <path d="M17 28c3 4 11 4 14 0" />
        <path d="M18 19v2M30 19v2" />
      </>
    ),
  },
  emergencias: {
    bg: "#C2432B",
    fg: "#FFF6EA",
    draw: (
      <>
        <path d="M14 34V24a10 10 0 0 1 20 0v10" />
        <path d="M9 34h30v5H9z" />
        <path d="M24 6v4M10 12l3 3M38 12l-3 3" />
      </>
    ),
  },
};

const FALLBACK = ART.charla;

export function artFor(category: PhraseCategory | string) {
  return ART[category] ?? FALLBACK;
}

/** The emblem alone, sized to fill its box. */
export function PhraseArt({
  category,
  size = 48,
  className = "",
  tint,
}: {
  category: PhraseCategory | string;
  size?: number;
  className?: string;
  /** Line color; the card's own ink when missing. */
  tint?: string;
}) {
  const a = artFor(category);
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={{ color: tint ?? a.fg }}
    >
      {a.draw}
    </svg>
  );
}
