"use client";

import { useStore } from "@/lib/store";

// The back of a game card, in whichever design is equipped.

const BACKS: Record<string, { bg: string; pattern: React.ReactNode }> = {
  clasico: {
    bg: "#B4532F",
    pattern: (
      <>
        <rect x="8" y="8" width="84" height="124" rx="10" fill="none" stroke="#F2A93B" strokeWidth="3" />
        <path d="M20 30h60v14l-5 5-5-5-5 5-5-5-5 5-5-5-5 5-5-5-5 5-5-5-5 5z" fill="#F2A93B" opacity="0.9" />
        <circle cx="50" cy="84" r="18" fill="none" stroke="#F2A93B" strokeWidth="3" />
        <circle cx="50" cy="84" r="6" fill="#F2A93B" />
        <path d="M20 112h60" stroke="#F2A93B" strokeWidth="3" strokeLinecap="round" />
      </>
    ),
  },
  azulejo: {
    bg: "#F5F1E8",
    pattern: (
      <>
        <rect x="8" y="8" width="84" height="124" rx="10" fill="none" stroke="#1F4E9C" strokeWidth="4" />
        {[38, 70, 102].map((y) => (
          <g key={y} fill="none" stroke="#1F4E9C" strokeWidth="3">
            <path d={`M50 ${y - 14}l14 14-14 14-14-14z`} />
            <circle cx="50" cy={y} r="4" fill="#1F4E9C" />
            <path d={`M22 ${y}h8M70 ${y}h8`} strokeLinecap="round" />
          </g>
        ))}
      </>
    ),
  },
  cempasuchil: {
    bg: "#E8891C",
    pattern: (
      <>
        <rect x="8" y="8" width="84" height="124" rx="10" fill="none" stroke="#FFD27A" strokeWidth="3" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
          <ellipse
            key={a}
            cx="50"
            cy="52"
            rx="8"
            ry="18"
            fill="#FFD27A"
            opacity="0.85"
            transform={`rotate(${a} 50 70)`}
          />
        ))}
        <circle cx="50" cy="70" r="10" fill="#C2432B" />
      </>
    ),
  },
  noche: {
    bg: "#1B2340",
    pattern: (
      <>
        <rect x="8" y="8" width="84" height="124" rx="10" fill="none" stroke="#F2E2A8" strokeWidth="2" />
        <path d="M62 40a16 16 0 1 0 10 26 13 13 0 0 1-10-26z" fill="#F2E2A8" />
        {[
          [24, 30],
          [30, 92],
          [70, 104],
          [44, 118],
          [80, 80],
          [22, 64],
        ].map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="2.2" fill="#F2E2A8" />
        ))}
      </>
    ),
  },
};

export function CardBack({ className = "" }: { className?: string }) {
  const { data } = useStore();
  const back = BACKS[data.progress.equipped.cardBack] ?? BACKS.clasico;
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 100 140"
      preserveAspectRatio="xMidYMid slice"
      className={`h-full w-full ${className}`}
      style={{ background: back.bg }}
    >
      {back.pattern}
    </svg>
  );
}
