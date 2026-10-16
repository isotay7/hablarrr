"use client";

import { MotionConfig } from "motion/react";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { isActive, markActive } from "@/lib/activity";
import { BASE } from "@/lib/base";
import { useStore } from "@/lib/store";
import { DeckFlyProvider } from "./DeckFly";
import { TabBar } from "./TabBar";

// Full-screen flows hide the tab bar.
const IMMERSIVE = [/^\/leer\/.+/, /^\/enfoque/, /^\/mision/, /^\/repasar\/sesion/];

const TICK_MS = 5000;
const FLUSH_MS = 15000;

function ActivityTracker() {
  const { addSeconds } = useStore();
  useEffect(() => {
    let pending = 0;
    const onInput = () => markActive();
    const events = ["pointerdown", "keydown", "wheel", "touchmove"] as const;
    events.forEach((e) => window.addEventListener(e, onInput, { passive: true }));
    const tick = setInterval(() => {
      if (isActive()) pending += TICK_MS / 1000;
    }, TICK_MS);
    const flush = () => {
      if (pending > 0) {
        addSeconds(pending);
        pending = 0;
      }
    };
    const flushTimer = setInterval(flush, FLUSH_MS);
    const onHide = () => document.visibilityState === "hidden" && flush();
    document.addEventListener("visibilitychange", onHide);
    return () => {
      events.forEach((e) => window.removeEventListener(e, onInput));
      clearInterval(tick);
      clearInterval(flushTimer);
      document.removeEventListener("visibilitychange", onHide);
      flush();
    };
  }, [addSeconds]);
  return null;
}

function ServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker
      .register(`${BASE}/sw.js`, { scope: `${BASE}/`, updateViaCache: "none" })
      .catch(() => {});
  }, []);
  return null;
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const immersive = IMMERSIVE.some((r) => r.test(pathname));

  return (
    <MotionConfig reducedMotion="user">
      <DeckFlyProvider>
        <ActivityTracker />
        <ServiceWorker />
        <div className="flex h-dvh flex-col overflow-hidden">
          <main className="relative min-h-0 flex-1">{children}</main>
          {!immersive && <TabBar />}
        </div>
      </DeckFlyProvider>
    </MotionConfig>
  );
}
