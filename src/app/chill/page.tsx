"use client";

import { animate, motion, useMotionValue, type PanInfo } from "motion/react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { characters } from "@/content";
import { DeckTarget } from "@/components/DeckFly";
import { Icon } from "@/components/Icon";
import { SaveButton } from "@/components/SaveButton";
import { Sentence } from "@/components/Sentence";
import { Loading, SpanishOnlyToggle } from "@/components/ui";
import { dayKey } from "@/lib/dates";
import { buildFeed, type FeedItem, type FeedKind } from "@/lib/feed";
import { usePlayer } from "@/lib/player";
import { sfx } from "@/lib/sounds";
import { useStore } from "@/lib/store";

const KIND: Record<FeedKind, { label: string; tint: string; chip: string }> = {
  frase: { label: "Frase", tint: "var(--terra-soft)", chip: "bg-terra" },
  dialogo: { label: "Mini diálogo", tint: "var(--blue-soft)", chip: "bg-blue" },
  historia: { label: "Historia", tint: "var(--accent)", chip: "bg-[#B97A14]" },
  cultura: { label: "Cultura", tint: "var(--terra-soft)", chip: "bg-terra" },
};

const SPRING = { type: "spring", stiffness: 380, damping: 38, mass: 0.9 } as const;
const POS_KEY = "hablarrr-feed-pos";

export default function ChillPage() {
  const { ready } = useStore();
  // The feed order depends on today's date, so it is built only in the browser.
  if (!ready) return <Loading />;
  return <Feed />;
}

function Feed() {
  const { data } = useStore();
  const spanishOnly = data.settings.spanishOnly;
  const items = useMemo(
    () => buildFeed(dayKey()).filter((it) => !(spanishOnly && it.kind === "cultura")),
    [spanishOnly],
  );
  const { stop } = usePlayer();
  const viewport = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);
  const [index, setIndex] = useState(() => {
    try {
      return Math.min(Number(sessionStorage.getItem(POS_KEY)) || 0, items.length - 1);
    } catch {
      return 0;
    }
  });
  const y = useMotionValue(0);

  useEffect(() => {
    const el = viewport.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setHeight(el.clientHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Keep the current card in place when the size changes (rotation).
  useEffect(() => {
    if (height) y.set(-index * height);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [height]);

  const go = useCallback(
    (next: number) => {
      const clamped = Math.max(0, Math.min(items.length - 1, next));
      if (clamped !== index) {
        sfx.tap();
        stop();
      }
      setIndex(clamped);
      try {
        sessionStorage.setItem(POS_KEY, String(clamped));
      } catch {}
      void animate(y, -clamped * height, SPRING);
    },
    [height, index, items.length, stop, y],
  );

  const onDragEnd = (_: unknown, info: PanInfo) => {
    const swipe = info.offset.y + info.velocity.y * 0.2;
    if (swipe < -height * 0.18) go(index + 1);
    else if (swipe > height * 0.18) go(index - 1);
    else go(index);
  };

  // Mouse wheel and arrow keys, for testing on a computer.
  useEffect(() => {
    let lock = 0;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) < 20 || Date.now() < lock) return;
      lock = Date.now() + 600;
      go(index + (e.deltaY > 0 ? 1 : -1));
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "PageDown") go(index + 1);
      if (e.key === "ArrowUp" || e.key === "PageUp") go(index - 1);
    };
    const el = viewport.current;
    el?.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("keydown", onKey);
    return () => {
      el?.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKey);
    };
  }, [go, index]);

  return (
    <div className="relative h-full overflow-hidden">
      <div className="pt-safe pointer-events-none absolute inset-x-0 top-0 z-10">
        <div className="flex items-center justify-between px-5 pt-5 sm:px-8">
          <div className="pointer-events-auto">
            <SpanishOnlyToggle className="bg-[color-mix(in_srgb,var(--bg)_60%,transparent)] backdrop-blur" />
          </div>
          <span className="text-sm font-bold uppercase tracking-[0.08em] text-muted">Modo chill</span>
          <Link
            href="/repasar"
            aria-label={`My deck, ${data.deck.length} cards`}
            className="pointer-events-auto relative flex h-14 w-14 items-center justify-center rounded-full border border-line bg-[color-mix(in_srgb,var(--bg)_60%,transparent)] text-accent-text backdrop-blur"
          >
            <DeckTarget>
              <Icon name="deck" size={26} />
            </DeckTarget>
            <span className="absolute -right-1 -top-1 flex h-6 min-w-6 items-center justify-center rounded-full bg-terra-soft px-1.5 text-xs font-extrabold text-white">
              {data.deck.length}
            </span>
          </Link>
        </div>
      </div>

      <div ref={viewport} className="h-full touch-none select-none" aria-roledescription="carousel">
        {height > 0 && (
          <motion.div
            style={{ y }}
            drag="y"
            dragConstraints={{ top: -(items.length - 1) * height, bottom: 0 }}
            dragElastic={0.25}
            dragMomentum={false}
            onDragEnd={onDragEnd}
            className="relative"
          >
            {items.map((item, k) =>
              Math.abs(k - index) <= 1 ? (
                <div
                  key={item.id}
                  className="absolute inset-x-0"
                  style={{ top: k * height, height }}
                  aria-hidden={k !== index}
                >
                  <FeedCard item={item} pos={`${k + 1} / ${items.length}`} first={k === 0} active={k === index} />
                </div>
              ) : null,
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}

function FeedCard({ item, pos, first, active }: { item: FeedItem; pos: string; first: boolean; active: boolean }) {
  const { data } = useStore();
  const { play, playingId, stop } = usePlayer();
  const spanishOnly = data.settings.spanishOnly;
  const k = KIND[item.kind];
  const multi = item.lines.length > 1;
  const playingHere = item.lines.some((l) => l.id === playingId);

  const playAll = (speed: "normal" | "slow") => {
    if (playingHere) {
      stop();
      return;
    }
    const run = (i: number) => {
      const l = item.lines[i];
      if (l) play(l.id, l.es, { speed, onEnd: () => setTimeout(() => run(i + 1), 350) });
    };
    run(0);
  };

  return (
    <section
      aria-label={k.label}
      className="relative flex h-full flex-col overflow-hidden"
      style={{ background: `color-mix(in srgb, ${k.tint} 13%, var(--bg))` }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-[30%] -top-[20%] aspect-square w-[95%] rounded-full"
        style={{
          background: `radial-gradient(closest-side, color-mix(in srgb, ${k.tint} 32%, transparent), transparent)`,
        }}
      />
      <div className="relative flex flex-1 flex-col justify-center gap-7 pb-24 pl-6 pr-28 pt-28 sm:pl-16 sm:pr-40">
        <div className="flex flex-wrap items-center gap-3">
          <span
            className={`rounded-full px-4 py-2 text-sm font-extrabold uppercase tracking-[0.04em] text-[#FFF6EA] ${k.chip}`}
          >
            {k.label}
          </span>
          <span className="text-base font-semibold text-muted">{item.context}</span>
        </div>

        {item.culture && !spanishOnly ? (
          <div className="flex flex-col gap-4">
            <h2 className="font-display text-[clamp(34px,6vw,60px)] font-bold leading-tight">{item.culture.title}</h2>
            <p className="max-w-xl text-[clamp(19px,2.6vw,24px)] leading-relaxed text-soft">{item.culture.text}</p>
            <p className="text-muted">You’ll say:</p>
          </div>
        ) : null}

        <div className="flex flex-col gap-6">
          {item.lines.map((l) => (
            <div key={l.id} className="flex flex-col gap-2">
              {l.who && characters[l.who].name && (
                <span className="text-[17px] font-bold text-accent-text">{characters[l.who].name}</span>
              )}
              <div className="flex items-start gap-3">
                <Sentence
                  id={l.id}
                  es={l.es}
                  line={l.line}
                  size={item.culture ? "feedSmall" : multi ? "feedSmall" : "feed"}
                  className="-ml-1.5"
                />
                {multi && (
                  <div className="mt-2 shrink-0">
                    <SaveButton card={l.card} variant="round" className="!h-12 !w-12" />
                  </div>
                )}
              </div>
              {!spanishOnly && <p className="pl-1 text-[clamp(18px,2.4vw,22px)] leading-snug text-soft">{l.en}</p>}
            </div>
          ))}
        </div>

        {item.note && !spanishOnly && (
          <div className="flex max-w-xl items-start gap-3 rounded-[20px] bg-note px-5 py-4 text-lg leading-snug text-soft">
            <Icon name="bulb" size={22} className="mt-0.5 shrink-0 text-accent-text" />
            <span>{item.note}</span>
          </div>
        )}
        {item.href && (
          <Link href={item.href} className="w-fit text-base font-semibold text-muted underline underline-offset-4">
            Read the whole {item.kind === "historia" ? "story" : "dialogue"}
          </Link>
        )}
      </div>

      <div className="absolute bottom-24 right-5 flex flex-col items-center gap-4 sm:right-9">
        <button
          type="button"
          onClick={() => playAll("normal")}
          aria-label={playingHere ? "Stop" : "Play"}
          className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-accent text-accent-ink shadow-[0_10px_30px_var(--glow)] transition-transform active:scale-90"
        >
          <Icon name={playingHere ? "stop" : "play"} size={30} />
        </button>
        <button
          type="button"
          onClick={() => playAll("slow")}
          aria-label="Play slowly"
          className="flex h-16 w-16 flex-col items-center justify-center gap-0.5 rounded-full border border-[color-mix(in_srgb,var(--text)_22%,transparent)] bg-black/25 text-[13px] font-extrabold text-text transition-transform active:scale-90"
        >
          <Icon name="turtle" size={20} />
          Lento
        </button>
        {!multi && <SaveButton card={item.lines[0].card} variant="round" />}
        <span className="text-sm font-bold text-muted">{pos}</span>
      </div>

      {first && active && (
        <motion.div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-8 flex flex-col items-center gap-1 text-[15px] font-semibold text-muted"
          animate={{ y: [0, -8, 0], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        >
          <Icon name="arrowUp" size={24} />
          swipe up
        </motion.div>
      )}
    </section>
  );
}
