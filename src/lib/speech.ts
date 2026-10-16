// Text-to-speech with a Mexican Spanish voice and word-by-word (karaoke) progress.
//
// Safari on iOS does not reliably fire `boundary` events, so we start an estimated
// timeline right away and switch to real boundaries if the browser sends them.

import type { SpeedName } from "./db";

export const RATES: Record<SpeedName, number> = { normal: 0.92, slow: 0.65 };

type Listener = () => void;
const voiceListeners = new Set<Listener>();
let cachedVoices: SpeechSynthesisVoice[] = [];

export function speechSupported() {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

function refreshVoices() {
  cachedVoices = window.speechSynthesis.getVoices();
  voiceListeners.forEach((l) => l());
}

if (speechSupported()) {
  refreshVoices();
  window.speechSynthesis.addEventListener?.("voiceschanged", refreshVoices);
}

export function onVoicesChanged(l: Listener) {
  voiceListeners.add(l);
  return () => voiceListeners.delete(l);
}

export function spanishVoices(): SpeechSynthesisVoice[] {
  const voices = cachedVoices.filter((v) => v.lang.toLowerCase().replace("_", "-").startsWith("es"));
  const score = (v: SpeechSynthesisVoice) => {
    const lang = v.lang.toLowerCase().replace("_", "-");
    let s = 0;
    if (lang === "es-mx") s += 100;
    else if (lang === "es-us" || lang === "es-419") s += 60;
    else if (lang !== "es-es") s += 30;
    if (/enhanced|premium|natural|neural/i.test(v.name)) s += 20;
    if (v.localService) s += 5;
    return s;
  };
  return voices.sort((a, b) => score(b) - score(a));
}

export function pickVoice(preferredURI: string | null): SpeechSynthesisVoice | null {
  const list = spanishVoices();
  return list.find((v) => v.voiceURI === preferredURI) ?? list[0] ?? null;
}

export function hasMexicanVoice() {
  return spanishVoices().some((v) => v.lang.toLowerCase().replace("_", "-") === "es-mx");
}

export interface SpeakOptions {
  speed: SpeedName;
  voiceURI: string | null;
  /** Called with the index of the word being spoken (split on whitespace), or -1 when done. */
  onWord?: (index: number) => void;
  onEnd?: () => void;
}

let current: { cancel: () => void } | null = null;

export function stopSpeaking() {
  current?.cancel();
  current = null;
  if (speechSupported()) window.speechSynthesis.cancel();
}

/** Rough per-word durations in ms from syllable-ish length, tuned for es-MX at rate 1. */
function estimateTimeline(words: string[], rate: number): number[] {
  const starts: number[] = [];
  let t = 120;
  for (const w of words) {
    starts.push(t);
    const letters = w.replace(/[^\p{L}]/gu, "").length;
    const vowels = (w.match(/[aeiouáéíóúü]/gi) ?? []).length || 1;
    let dur = 90 + vowels * 140 + letters * 12;
    if (/[.!?…]$/.test(w)) dur += 320;
    else if (/[,;:]$/.test(w)) dur += 160;
    t += dur / rate;
  }
  return starts;
}

export function speak(text: string, opts: SpeakOptions) {
  stopSpeaking();
  if (!speechSupported()) {
    opts.onEnd?.();
    return;
  }
  const synth = window.speechSynthesis;
  const words = text.split(/\s+/).filter(Boolean);
  const offsets: number[] = [];
  {
    let pos = 0;
    for (const w of words) {
      const i = text.indexOf(w, pos);
      offsets.push(i);
      pos = i + w.length;
    }
  }

  const u = new SpeechSynthesisUtterance(text);
  const rate = RATES[opts.speed];
  u.rate = rate;
  u.lang = "es-MX";
  const voice = pickVoice(opts.voiceURI);
  if (voice) {
    u.voice = voice;
    u.lang = voice.lang;
  }

  let timers: ReturnType<typeof setTimeout>[] = [];
  let usingBoundaries = false;
  let done = false;
  const clearTimers = () => {
    timers.forEach(clearTimeout);
    timers = [];
  };
  const finish = () => {
    if (done) return;
    done = true;
    clearTimers();
    opts.onWord?.(-1);
    opts.onEnd?.();
  };

  const startEstimate = () => {
    estimateTimeline(words, rate).forEach((ms, i) => {
      timers.push(setTimeout(() => !usingBoundaries && opts.onWord?.(i), ms));
    });
  };

  u.onstart = startEstimate;
  u.onboundary = (e) => {
    if (e.name && e.name !== "word") return;
    if (!usingBoundaries) {
      usingBoundaries = true;
      clearTimers();
    }
    let idx = 0;
    for (let i = 0; i < offsets.length; i++) if (offsets[i] <= e.charIndex) idx = i;
    opts.onWord?.(idx);
  };
  u.onend = finish;
  u.onerror = finish;

  const handle = {
    cancel: () => {
      done = true;
      clearTimers();
      opts.onWord?.(-1);
    },
  };
  current = handle;
  // iOS sometimes drops an utterance queued in the same tick as cancel().
  setTimeout(() => {
    if (current === handle) synth.speak(u);
  }, 30);
}
