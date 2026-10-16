"use client";

import { usePlayer } from "@/lib/player";
import { Icon } from "./Icon";

/** Normal and slow play buttons for one sentence. Tapping while playing stops. */
export function PlayButtons({ id, text, compact = false }: { id: string; text: string; compact?: boolean }) {
  const { playingId, play, stop } = usePlayer();
  const playing = playingId === id;
  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={() => (playing ? stop() : play(id, text, { speed: "normal" }))}
        aria-label={playing ? "Stop" : "Play"}
        className={`flex h-12 items-center gap-2 rounded-full px-[18px] text-base font-bold transition-[transform,background-color] active:scale-95 ${
          playing ? "bg-accent text-accent-ink" : "bg-surface text-text"
        }`}
      >
        <Icon name={playing ? "stop" : "play"} size={18} />
        {!compact && (playing ? "Parar" : "Escuchar")}
      </button>
      <button
        type="button"
        onClick={() => play(id, text, { speed: "slow" })}
        aria-label="Play slowly"
        className="flex h-12 items-center gap-1.5 rounded-full bg-surface px-4 text-sm font-extrabold text-text transition-transform active:scale-95"
      >
        <Icon name="turtle" size={18} />
        Lento
      </button>
    </div>
  );
}
