// Counts practice time: seconds while the app is visible and you touched it
// (or audio played) in the last 90 seconds.

const IDLE_MS = 90_000;
let lastActive = 0;

export function markActive() {
  lastActive = Date.now();
}

export function isActive(now = Date.now()) {
  return typeof document !== "undefined" && document.visibilityState === "visible" && now - lastActive < IDLE_MS;
}
