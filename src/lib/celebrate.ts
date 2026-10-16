import confetti from "canvas-confetti";
import { sfx } from "./sounds";

const COLORS = ["#F2A93B", "#D2694A", "#4F7BC9", "#F6EBDD", "#E8C26A"];

let flag: confetti.Shape | null = null;
function papelPicado(): confetti.Shape {
  // A tiny papel picado flag with a zigzag bottom.
  flag ??= confetti.shapeFromPath({ path: "M0 0H16V13L14 15L12 13L10 15L8 13L6 15L4 13L2 15L0 13Z" });
  return flag;
}

function reduced() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Papel picado burst from the bottom corners. */
export function celebrate(kind: "small" | "big" = "big") {
  sfx.win();
  if (reduced()) return;
  const shapes = [papelPicado(), "square" as const];
  const base = { colors: COLORS, shapes, scalar: 1.4, ticks: 260, gravity: 0.9, disableForReducedMotion: true };
  if (kind === "small") {
    void confetti({ ...base, particleCount: 60, spread: 80, origin: { y: 0.7 } });
    return;
  }
  void confetti({ ...base, particleCount: 90, angle: 60, spread: 70, origin: { x: 0, y: 0.85 }, startVelocity: 60 });
  void confetti({ ...base, particleCount: 90, angle: 120, spread: 70, origin: { x: 1, y: 0.85 }, startVelocity: 60 });
  setTimeout(() => {
    void confetti({ ...base, particleCount: 70, spread: 120, origin: { y: 0.35 }, startVelocity: 30 });
  }, 250);
}
