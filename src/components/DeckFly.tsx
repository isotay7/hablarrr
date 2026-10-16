"use client";

import { AnimatePresence, motion, useAnimate, useReducedMotion } from "motion/react";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { sfx } from "@/lib/sounds";
import { Icon } from "./Icon";

// When you save a sentence, a chip flies from the button into the deck icon,
// which then bounces. Any deck icon on screen can register as the target;
// the most recently mounted one wins.

interface Flight {
  id: number;
  from: DOMRect;
  to: DOMRect | null;
}

interface DeckFlyValue {
  fly(from: Element): void;
  register(el: HTMLElement): () => void;
  bump: number;
}

const Ctx = createContext<DeckFlyValue | null>(null);

export function useDeckFly() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useDeckFly outside DeckFlyProvider");
  return v;
}

export function DeckFlyProvider({ children }: { children: React.ReactNode }) {
  const targets = useRef<HTMLElement[]>([]);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [bump, setBump] = useState(0);
  const reduce = useReducedMotion();

  const register = useCallback((el: HTMLElement) => {
    targets.current.push(el);
    return () => {
      targets.current = targets.current.filter((t) => t !== el);
    };
  }, []);

  const fly = useCallback(
    (from: Element) => {
      sfx.save();
      const target = [...targets.current].reverse().find((t) => t.isConnected && t.getClientRects().length > 0);
      if (reduce || !target) {
        setBump((b) => b + 1);
        return;
      }
      setFlights((f) => [
        ...f,
        { id: Date.now() + Math.random(), from: from.getBoundingClientRect(), to: target.getBoundingClientRect() },
      ]);
    },
    [reduce],
  );

  const land = (id: number) => {
    setFlights((f) => f.filter((x) => x.id !== id));
    setBump((b) => b + 1);
  };

  return (
    <Ctx.Provider value={{ fly, register, bump }}>
      {children}
      <div className="pointer-events-none fixed inset-0 z-[60]" aria-hidden="true">
        <AnimatePresence>
          {flights.map((f) => {
            const startX = f.from.left + f.from.width / 2 - 28;
            const startY = f.from.top + f.from.height / 2 - 28;
            const endX = f.to ? f.to.left + f.to.width / 2 - 28 : startX;
            const endY = f.to ? f.to.top + f.to.height / 2 - 28 : startY - 200;
            return (
              <motion.div
                key={f.id}
                className="absolute flex h-14 w-14 items-center justify-center rounded-full bg-accent text-accent-ink shadow-xl"
                initial={{ x: startX, y: startY, scale: 0.6, opacity: 0 }}
                animate={{
                  x: [startX, (startX + endX) / 2, endX],
                  y: [startY, Math.min(startY, endY) - 120, endY],
                  scale: [1, 1.1, 0.35],
                  opacity: [1, 1, 0.9],
                }}
                transition={{ duration: 0.62, ease: [0.45, 0, 0.55, 1], times: [0, 0.45, 1] }}
                onAnimationComplete={() => land(f.id)}
              >
                <Icon name="bookmarkFilled" size={26} />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </Ctx.Provider>
  );
}

/** Wrap a deck icon so it becomes a landing target and bounces on each save. */
export function DeckTarget({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const { register, bump } = useDeckFly();
  const [scope, animate] = useAnimate<HTMLSpanElement>();
  useEffect(() => (scope.current ? register(scope.current) : undefined), [register, scope]);
  useEffect(() => {
    if (bump && scope.current) {
      void animate(scope.current, { scale: [1.45, 1] }, { type: "spring", stiffness: 500, damping: 12 });
    }
  }, [bump, animate, scope]);
  return (
    <span ref={scope} className={`inline-flex ${className}`}>
      {children}
    </span>
  );
}
