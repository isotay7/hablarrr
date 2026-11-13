"use client";

import Link from "next/link";
import { refLabel } from "@/content/faith/men";
import { tonight } from "@/lib/faith";
import { sfx } from "@/lib/sounds";
import { useStore } from "@/lib/store";
import { Icon } from "../Icon";
import { Kicker } from "../ui";
import { Candle } from "./FaithKit";

/** Tonight's reading, or what's coming tomorrow. Also used on Home. */
export function TonightCard({ compact = false }: { compact?: boolean }) {
  const { data } = useStore();
  const t = tonight(data.faith);

  if (!t.next)
    return (
      <div className="flex items-center gap-4 rounded-[28px] bg-learn px-6 py-5">
        <Icon name="check" size={28} strokeWidth={3} className="text-accent-text" />
        <span className="text-lg font-semibold">You’ve read the whole path. Every recap stays open to reread.</span>
      </div>
    );

  const { next } = t;
  if (!t.open)
    return (
      <div className="flex items-center gap-4 rounded-[28px] border border-line bg-card px-6 py-5">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent text-accent-ink">
          <Icon name="check" size={26} strokeWidth={3} />
        </span>
        <span className="flex flex-col">
          <span className="font-serif text-2xl font-semibold">Leído esta noche</span>
          <span className="text-muted">
            Tomorrow night: {next.man.name}, “{next.day.title}”
          </span>
        </span>
      </div>
    );

  return (
    <Link
      href={`/fe/noche/?d=${next.id}`}
      onClick={() => sfx.tap()}
      className="relative flex items-center gap-5 overflow-hidden rounded-[32px] border border-[color-mix(in_srgb,var(--accent)_35%,transparent)] bg-card p-6 shadow-[0_24px_60px_color-mix(in_srgb,var(--accent)_14%,transparent)] transition-transform active:scale-[0.98] sm:p-7"
    >
      <span
        aria-hidden
        className="candle pointer-events-none absolute -left-16 -top-20 h-72 w-72 rounded-full"
        style={{ background: "radial-gradient(closest-side, var(--candle), transparent)" }}
      />
      <span className="relative shrink-0">
        <Candle size={compact ? 44 : 56} />
      </span>
      <span className="relative flex min-w-0 flex-1 flex-col gap-1.5">
        <Kicker className="text-accent-text">
          Tonight’s reading · {next.man.name} {next.dayIndex + 1}/{next.man.days.length}
        </Kicker>
        <span className="font-serif text-[clamp(26px,4.5vw,36px)] font-semibold leading-tight">{next.day.title}</span>
        <span className="text-[15px] text-muted">{refLabel(next.day.read)} · 5–7 minutes</span>
      </span>
      <span className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-accent text-accent-ink">
        <Icon name="play" size={24} />
      </span>
    </Link>
  );
}
