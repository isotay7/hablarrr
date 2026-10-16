"use client";

import Link from "next/link";
import { characters } from "@/content";
import type { CharacterId, Line, MissionTag } from "@/content/types";
import { useStore } from "@/lib/store";
import { sfx } from "@/lib/sounds";
import { Icon, type IconName } from "./Icon";

export function RoundButton({
  icon,
  label,
  onClick,
  href,
  tone = "surface",
  size = 52,
  className = "",
}: {
  icon: IconName;
  label: string;
  onClick?: () => void;
  href?: string;
  tone?: "surface" | "accent" | "ghost";
  size?: number;
  className?: string;
}) {
  const tones = {
    surface: "bg-surface text-text",
    accent: "bg-accent text-accent-ink",
    ghost: "border border-line text-text",
  };
  const cls = `flex shrink-0 items-center justify-center rounded-full transition-transform duration-150 active:scale-90 ${tones[tone]} ${className}`;
  const style = { width: size, height: size };
  if (href)
    return (
      <Link href={href} aria-label={label} className={cls} style={style} onClick={() => sfx.tap()}>
        <Icon name={icon} size={Math.round(size * 0.44)} />
      </Link>
    );
  return (
    <button type="button" aria-label={label} className={cls} style={style} onClick={onClick}>
      <Icon name={icon} size={Math.round(size * 0.44)} />
    </button>
  );
}

export function Avatar({ who, size = 48 }: { who: CharacterId; size?: number }) {
  const c = characters[who];
  if (!c.initial) return null;
  return (
    <span
      aria-hidden="true"
      className="flex shrink-0 items-center justify-center rounded-full font-display font-extrabold"
      style={{ width: size, height: size, background: c.bg, color: c.fg, fontSize: size * 0.42 }}
    >
      {c.initial}
    </span>
  );
}

export function RegisterBadge({ line }: { line: Line }) {
  if (!line.reg) return null;
  const label = line.reg === "tu" ? "tú" : line.reg;
  const formal = line.reg !== "tu";
  return (
    <span
      className={`rounded-full px-3 py-1 text-[13px] font-extrabold tracking-wide ${
        formal
          ? "bg-[color-mix(in_srgb,var(--blue-soft)_22%,transparent)] text-blue-text"
          : "bg-[color-mix(in_srgb,var(--terra-soft)_20%,transparent)] text-terra-text"
      }`}
    >
      {label}
      {line.to ? ` · to ${line.to}` : ""}
    </span>
  );
}

export function SpanishOnlyToggle({ className = "" }: { className?: string }) {
  const { data, updateSettings, startHereDone } = useStore();
  const on = data.settings.spanishOnly;
  if (!startHereDone)
    return (
      <span
        title="Unlocks after all 50 Start Here phrases"
        className={`flex h-12 items-center gap-2 rounded-full border border-dashed border-line px-5 text-[15px] font-bold text-muted ${className}`}
      >
        <Icon name="lock" size={16} strokeWidth={2.4} /> Solo español
      </span>
    );
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={() => {
        sfx.tap();
        updateSettings({ spanishOnly: !on });
      }}
      className={`h-12 rounded-full border px-5 text-[15px] font-bold transition-colors active:scale-95 ${
        on ? "border-accent bg-accent text-accent-ink" : "border-line text-text"
      } ${className}`}
    >
      Solo español
    </button>
  );
}

export function ThemeToggle() {
  const { data, updateSettings } = useStore();
  const night = data.settings.theme === "night";
  return (
    <RoundButton
      icon={night ? "moon" : "sun"}
      label={night ? "Switch to light mode" : "Switch to night mode"}
      onClick={() => {
        sfx.tap();
        updateSettings({ theme: night ? "light" : "night" });
      }}
    />
  );
}

export function SoundToggle() {
  const { data, updateSettings } = useStore();
  const on = data.settings.sound;
  return (
    <RoundButton
      icon={on ? "speaker" : "mute"}
      label={on ? "Mute sounds" : "Turn sounds on"}
      onClick={() => {
        updateSettings({ sound: !on });
        if (!on) setTimeout(() => sfx.tap(), 0);
      }}
    />
  );
}

export function Loading() {
  return (
    <div className="flex h-full items-center justify-center" role="status">
      <span className="candle h-3 w-3 rounded-full bg-accent shadow-[0_0_30px_10px_var(--glow)]" />
      <span className="sr-only">Loading</span>
    </div>
  );
}

export function CandleGlow() {
  return (
    <div
      aria-hidden="true"
      className="candle pointer-events-none absolute -top-64 left-1/2 h-[720px] w-[140%] -translate-x-1/2"
      style={{ background: "radial-gradient(closest-side, var(--candle), transparent)" }}
    />
  );
}

export function Kicker({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`text-[13px] font-extrabold uppercase tracking-[0.08em] ${className}`}>{children}</div>;
}

const MISSION_CHIP: Record<MissionTag, { label: string; cls: string }> = {
  family: { label: "Familia", cls: "bg-[color-mix(in_srgb,var(--terra-soft)_20%,transparent)] text-terra-text" },
  travel: { label: "Viaje", cls: "bg-[color-mix(in_srgb,var(--blue-soft)_22%,transparent)] text-blue-text" },
  both: { label: "Familia + viaje", cls: "bg-learn text-accent-text" },
};

export function MissionChip({ mission, className = "" }: { mission: MissionTag; className?: string }) {
  const c = MISSION_CHIP[mission];
  return (
    <span className={`rounded-full px-3 py-1 text-[13px] font-extrabold tracking-wide ${c.cls} ${className}`}>
      {c.label}
    </span>
  );
}
