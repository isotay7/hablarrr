"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { ReviewSession, type SessionResult } from "@/components/ReviewSession";
import { RoundButton, Loading } from "@/components/ui";
import { primaryBtn, secondaryBtn, WinScreen } from "@/components/WinScreen";
import { isDue } from "@/lib/srs";
import { streak } from "@/lib/stats";
import { useStore } from "@/lib/store";
import { characters } from "@/content";

const MAX_CARDS = 40;

export default function ReviewSessionPage() {
  const { ready, data } = useStore();
  const [ids, setIds] = useState<string[] | null>(null);
  const [result, setResult] = useState<SessionResult | null>(null);
  const onDone = useCallback((r: SessionResult) => setResult(r), []);

  if (!ready) return <Loading />;

  // Snapshot the due queue once, when the session starts.
  if (ids === null) {
    const due = data.deck
      .filter((c) => isDue(c))
      .sort((a, b) => a.fsrs.due - b.fsrs.due)
      .slice(0, MAX_CARDS)
      .map((c) => c.id);
    setIds(due);
    return <Loading />;
  }

  if (result || ids.length === 0) {
    return (
      <WinScreen
        quiet={ids.length === 0}
        title={ids.length === 0 ? "¡Todo listo!" : "¡Repaso completo!"}
        subtitle={ids.length === 0 ? "Nothing due right now." : `Review done. ¡Muy bien, ${characters.me.name}!`}
        stats={[
          { value: result?.reviewed ?? 0, label: "cards reviewed" },
          {
            value: result ? `${Math.round((result.correct / Math.max(1, result.reviewed)) * 100)}%` : "—",
            label: "recalled",
          },
          { value: streak(data.days), label: "night streak", hot: true },
        ]}
      >
        <Link href="/repasar" className={secondaryBtn}>
          Mi mazo
        </Link>
        <Link href="/progreso" className={primaryBtn}>
          See progress
        </Link>
      </WinScreen>
    );
  }

  return (
    <div className="pt-safe flex h-full flex-col">
      <div className="flex items-center px-5 pb-4 pt-5 sm:px-10">
        <RoundButton icon="close" label="End review" href="/repasar" />
      </div>
      <div className="min-h-0 flex-1">
        <ReviewSession initialIds={ids} onDone={onDone} label="Repaso" />
      </div>
    </div>
  );
}
