"use client";

import { motion } from "motion/react";
import type { FaithVerse, Man } from "@/content/faith/men";
import { refLabel } from "@/content/faith/men";
import { verseCardId, verseText } from "@/lib/faith";
import { usePlayer } from "@/lib/player";
import { Icon } from "../Icon";
import { SaveButton } from "../SaveButton";

/** A lit candle. The flame sways and breathes; still under reduced motion. */
export function Candle({ size = 96, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size * 1.5}
      viewBox="0 0 64 96"
      className={`overflow-visible ${className}`}
    >
      <defs>
        <radialGradient id="candle-halo">
          <stop offset="0%" stopColor="#F2A93B" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#F2A93B" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="candle-flame" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#FFF3D6" />
          <stop offset="55%" stopColor="#F2A93B" />
          <stop offset="100%" stopColor="#D2694A" />
        </linearGradient>
        <linearGradient id="candle-wax" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#E9D8BD" />
          <stop offset="60%" stopColor="#FFF6EA" />
          <stop offset="100%" stopColor="#D9C7B3" />
        </linearGradient>
      </defs>
      <motion.circle
        cx="32"
        cy="26"
        r="30"
        fill="url(#candle-halo)"
        animate={{ scale: [1, 1.12, 0.96, 1], opacity: [0.85, 1, 0.8, 0.85] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformOrigin: "32px 26px" }}
      />
      <rect x="20" y="44" width="24" height="48" rx="4" fill="url(#candle-wax)" />
      <path d="M20 50c4 3 8-1 12 2s8-1 12 1" stroke="#E9D8BD" strokeWidth="2" fill="none" />
      <path d="M32 44v-6" stroke="#2B1D15" strokeWidth="2" strokeLinecap="round" />
      <motion.path
        d="M32 8c6 8 9 13 9 19a9 9 0 0 1-18 0c0-6 3-11 9-19z"
        fill="url(#candle-flame)"
        animate={{ rotate: [-3, 3, -2, 2, -3], scaleY: [1, 1.08, 0.95, 1.05, 1] }}
        transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformOrigin: "32px 38px" }}
      />
    </svg>
  );
}

/** A small round badge for a man of the Bible: his initial, lit when earned. */
export function ManBadge({ man, earned, size = 56 }: { man: Man; earned: boolean; size?: number }) {
  return (
    <span
      aria-hidden="true"
      className={`relative flex shrink-0 items-center justify-center rounded-full font-serif font-semibold ${
        earned
          ? "bg-accent text-accent-ink shadow-[0_0_24px_var(--glow)]"
          : "border-2 border-dashed border-line text-muted"
      }`}
      style={{ width: size, height: size, fontSize: size * 0.42 }}
    >
      {man.es.charAt(0)}
    </span>
  );
}

/** A key verse: the 1909 Spanish, a plain paraphrase, and the English. */
export function VerseCard({ verse, saveable = false }: { verse: FaithVerse; saveable?: boolean }) {
  const { play, playingId, stop } = usePlayer();
  const t = verseText(verse);
  const id = verseCardId(verse.ref);
  const playing = playingId === id;
  return (
    <div className="flex w-full flex-col gap-4 rounded-[28px] border border-[color-mix(in_srgb,var(--accent)_30%,transparent)] bg-card px-6 py-6 text-left">
      <div className="text-[13px] font-extrabold uppercase tracking-[0.08em] text-accent-text">
        {refLabel(verse.ref, "es")} · Reina-Valera 1909
      </div>
      <p lang="es" className="font-serif text-[clamp(22px,3.6vw,30px)] leading-snug">
        {t.es}
      </p>
      {verse.simple && (
        <p lang="es" className="text-lg leading-snug text-soft">
          <span className="font-bold text-muted">Más fácil: </span>
          {verse.simple}
        </p>
      )}
      <p className="font-serif text-lg italic leading-snug text-muted">“{t.en}”</p>
      <div className="flex flex-wrap gap-3 pt-1">
        <button
          type="button"
          onClick={() => (playing ? stop() : play(id, t.es, { speed: "slow" }))}
          className="flex h-12 items-center gap-2 rounded-full bg-accent px-5 font-bold text-accent-ink active:scale-95"
        >
          <Icon name={playing ? "stop" : "play"} size={18} /> Escuchar
        </button>
        {saveable && (
          <SaveButton
            card={{
              id,
              source: "verse",
              sourceRef: verse.ref,
              sourceTitle: `Versículo · ${refLabel(verse.ref, "es")}`,
              es: t.es,
              en: t.en,
              note: verse.simple ? `Más fácil: ${verse.simple}` : undefined,
              stage1: false,
            }}
          />
        )}
      </div>
    </div>
  );
}
