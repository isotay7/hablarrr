export const FLAG_PATH =
  "M0 0H64V58L56 66L48 58L40 66L32 58L24 66L16 58L8 66L0 58Z M32 14L42 26L32 38L22 26Z M10 44a4 4 0 1 0 8 0a4 4 0 1 0 -8 0Z M46 44a4 4 0 1 0 8 0a4 4 0 1 0 -8 0Z M29 47a3 3 0 1 0 6 0a3 3 0 1 0 -6 0Z M6 6h10l-5 8Z M48 6h10l-5 8Z";

const FILLS = ["#F2A93B", "#D2694A", "#4F7BC9", "var(--text)"];

/** A string of papel picado flags hanging across the top of a screen. Decorative. */
export function PapelPicado({ count = 10, className = "" }: { count?: number; className?: string }) {
  const width = count * 82 + 12;
  return (
    <svg
      aria-hidden="true"
      viewBox={`0 0 ${width} 96`}
      preserveAspectRatio="xMidYMin slice"
      className={`pointer-events-none w-full ${className}`}
      style={{ opacity: "var(--flag-opacity)" }}
    >
      <path
        d={`M0 8 Q${width / 2} 44 ${width} 8`}
        stroke="var(--muted)"
        strokeOpacity="0.5"
        strokeWidth="1.5"
        fill="none"
      />
      {Array.from({ length: count }, (_, i) => {
        const x = 12 + i * 82;
        const t = (x + 32) / width - 0.5;
        const y = 8 + 18 * (1 - 4 * t * t);
        return (
          <g key={i} transform={`translate(${x} ${y.toFixed(1)})`}>
            <path
              className="flag-sway"
              style={{ animationDelay: `${-i * 1.3}s` }}
              d={FLAG_PATH}
              fillRule="evenodd"
              fill={FILLS[i % FILLS.length]}
            />
          </g>
        );
      })}
    </svg>
  );
}

export function FlagMark({ size = 22, color = "#D2694A" }: { size?: number; color?: string }) {
  return (
    <svg aria-hidden="true" width={size} height={(size * 66) / 64} viewBox="0 0 64 66" className="shrink-0">
      <path fill={color} fillRule="evenodd" d={FLAG_PATH} />
    </svg>
  );
}
