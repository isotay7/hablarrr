"use client";

import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { glossFor } from "@/content";
import type { Line } from "@/content/types";
import type { WordStatus } from "@/lib/db";
import { usePlayer } from "@/lib/player";
import { sfx } from "@/lib/sounds";
import { useStore } from "@/lib/store";
import { tokenize } from "@/lib/tokenize";
import { Icon } from "./Icon";

const SIZES = {
  reader: "font-display text-[clamp(28px,4.6vw,40px)] font-semibold leading-[1.55]",
  feed: "font-display text-[clamp(36px,7.5vw,76px)] font-bold leading-[1.18] tracking-[-0.01em]",
  feedSmall: "font-display text-[clamp(28px,5.2vw,50px)] font-bold leading-[1.25]",
  card: "font-display text-[clamp(32px,6vw,60px)] font-bold leading-[1.2] text-center",
} as const;

export function Sentence({
  id,
  es,
  line,
  size = "reader",
  className = "",
}: {
  /** Player id: karaoke highlights when this id is playing. */
  id: string;
  es: string;
  line?: Line;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  const { wordStatus } = useStore();
  const { playingId, wordIndex } = usePlayer();
  const [selected, setSelected] = useState<{ index: number; anchor: HTMLElement; pos: BubblePos } | null>(null);
  const tokens = tokenize(es);
  const playing = playingId === id;

  return (
    <p lang="es" className={`${SIZES[size]} ${className}`}>
      {tokens.map((t, i) => {
        const status: WordStatus = t.key ? wordStatus(t.key) : "known";
        const isOn = playing && wordIndex === i;
        const isSel = selected?.index === i;
        let look = "";
        if (isOn) look = "bg-accent text-accent-ink -translate-y-[3px]";
        else if (isSel)
          look = "bg-learn -translate-y-1 scale-[1.04] shadow-[0_0_0_2px_var(--accent),0_10px_30px_var(--glow)]";
        else if (status === "new")
          look =
            "underline decoration-dotted decoration-[3px] underline-offset-[0.28em] decoration-[color-mix(in_srgb,var(--accent-text)_70%,transparent)]";
        else if (status === "learning") look = "bg-learn";
        return (
          <span key={i}>
            <button
              type="button"
              disabled={!t.key}
              aria-expanded={isSel}
              aria-haspopup="dialog"
              onClick={(e) => {
                e.stopPropagation();
                if (isSel) {
                  setSelected(null);
                  return;
                }
                sfx.pop();
                setSelected({ index: i, anchor: e.currentTarget, pos: bubblePosition(e.currentTarget) });
              }}
              className={`-mx-[0.08em] inline-block cursor-pointer rounded-[0.3em] px-[0.12em] align-baseline transition-[transform,background-color,box-shadow,color] duration-200 ease-[cubic-bezier(.3,1.6,.5,1)] disabled:cursor-default ${look}`}
            >
              {t.text}
            </button>{" "}
          </span>
        );
      })}
      {selected && tokens[selected.index]?.key && (
        <WordBubble
          anchor={selected.anchor}
          pos={selected.pos}
          word={tokens[selected.index].text}
          wordKey={tokens[selected.index].key}
          line={line}
          onClose={() => setSelected(null)}
        />
      )}
    </p>
  );
}

const STATUS_LABELS: { status: WordStatus; label: string }[] = [
  { status: "new", label: "Nueva" },
  { status: "learning", label: "Aprendiendo" },
  { status: "known", label: "La sé" },
];

interface BubblePos {
  left: number;
  top?: number;
  bottom?: number;
  width: number;
  above: boolean;
}

/** Below the word when there's room, otherwise above; clamped inside the screen. */
function bubblePosition(anchor: HTMLElement): BubblePos {
  const r = anchor.getBoundingClientRect();
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const width = Math.min(360, vw - 32);
  const left = Math.min(Math.max(16, r.left + r.width / 2 - width / 2), vw - width - 16);
  const above = vh - r.bottom < 300 && r.top > vh - r.bottom;
  return above ? { left, bottom: vh - r.top + 12, width, above } : { left, top: r.bottom + 12, width, above };
}

function WordBubble({
  anchor,
  pos,
  word,
  wordKey,
  line,
  onClose,
}: {
  anchor: HTMLElement;
  pos: BubblePos;
  word: string;
  wordKey: string;
  line?: Line;
  onClose: () => void;
}) {
  const { wordStatus, setWordStatus } = useStore();
  const { play } = usePlayer();
  const ref = useRef<HTMLDivElement>(null);
  const gloss = glossFor(wordKey, line);
  const status = wordStatus(wordKey);
  const clean = word.replace(/^[¡¿«"“(]+|[!?.,;:»"”)…]+$/g, "");

  useEffect(() => {
    play(`word:${wordKey}`, clean, { speed: "slow" });
    // Only on open.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (ref.current?.contains(t) || anchor.contains(t)) return;
      onClose();
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    const onScroll = () => onClose();
    document.addEventListener("pointerdown", onDown, true);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onScroll);
    return () => {
      document.removeEventListener("pointerdown", onDown, true);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onScroll);
    };
  }, [anchor, onClose]);

  if (typeof document === "undefined") return null;
  return createPortal(
    <motion.div
      ref={ref}
      role="dialog"
      aria-label={`Meaning of ${clean}`}
      initial={{ opacity: 0, y: pos.above ? -8 : 8, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 520, damping: 30 }}
      style={{
        left: pos.left,
        top: pos.top,
        bottom: pos.bottom,
        width: pos.width,
        transformOrigin: pos.above ? "bottom center" : "top center",
      }}
      className="fixed z-50 flex flex-col gap-2.5 rounded-[22px] border border-line bg-bubble p-[18px] font-sans text-text shadow-[0_24px_60px_var(--shadow)]"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-start justify-between gap-3">
        <span lang="es" className="font-display text-[28px] font-bold leading-tight">
          {clean}
        </span>
        <button
          type="button"
          aria-label="Say this word slowly"
          onClick={() => play(`word:${wordKey}`, clean, { speed: "slow" })}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent text-accent-ink active:scale-90"
        >
          <Icon name="speaker" size={20} />
        </button>
      </div>
      {gloss ? (
        <>
          <div className="text-xl font-bold leading-snug">{gloss.g}</div>
          {gloss.l && (
            <div className="text-[15px] text-muted">
              from{" "}
              <b lang="es" className="text-soft">
                {gloss.l}
              </b>
            </div>
          )}
          {gloss.n && <div className="rounded-xl bg-note px-3 py-2.5 text-base leading-snug text-soft">{gloss.n}</div>}
        </>
      ) : (
        <div className="text-base text-muted">No meaning saved for this word yet.</div>
      )}
      <div role="group" aria-label="How well do you know this word?" className="grid grid-cols-3 gap-1.5 pt-1">
        {STATUS_LABELS.map((s) => {
          const on = status === s.status;
          return (
            <button
              key={s.status}
              type="button"
              aria-pressed={on}
              onClick={() => {
                sfx.tap();
                setWordStatus(wordKey, s.status);
              }}
              className={`h-11 rounded-xl border text-sm font-bold transition-colors active:scale-95 ${
                on ? "border-accent bg-accent text-accent-ink" : "border-line text-text"
              }`}
            >
              {s.label}
            </button>
          );
        })}
      </div>
    </motion.div>,
    document.body,
  );
}
