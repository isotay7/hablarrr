// Soft, marimba-like UI sounds synthesized with Web Audio. No audio files.

let enabled = true;
let ctx: AudioContext | null = null;

export function setSoundEnabled(on: boolean) {
  enabled = on;
}

function audio(): AudioContext | null {
  if (!enabled || typeof window === "undefined") return null;
  try {
    if (!ctx) {
      const AC =
        window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      ctx = new AC();
    }
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

/** One wooden-bar note: a sine with a quieter 4th harmonic and a fast decay. */
function bar(c: AudioContext, freq: number, at: number, gain = 0.12, decay = 0.45) {
  const out = c.createGain();
  out.gain.setValueAtTime(0.0001, at);
  out.gain.exponentialRampToValueAtTime(gain, at + 0.006);
  out.gain.exponentialRampToValueAtTime(0.0001, at + decay);
  out.connect(c.destination);
  for (const [mult, g] of [
    [1, 1],
    [4, 0.18],
  ] as const) {
    const osc = c.createOscillator();
    const og = c.createGain();
    osc.type = "sine";
    osc.frequency.value = freq * mult;
    og.gain.value = g;
    osc.connect(og).connect(out);
    osc.start(at);
    osc.stop(at + decay + 0.05);
  }
}

function play(fn: (c: AudioContext, t: number) => void) {
  const c = audio();
  if (!c) return;
  fn(c, c.currentTime + 0.005);
}

export const sfx = {
  tap: () => play((c, t) => bar(c, 1046, t, 0.05, 0.12)),
  pop: () => play((c, t) => bar(c, 784, t, 0.07, 0.25)),
  save: () =>
    play((c, t) => {
      bar(c, 659, t, 0.09, 0.3);
      bar(c, 988, t + 0.09, 0.09, 0.4);
    }),
  flip: () =>
    play((c, t) => {
      const len = 0.18;
      const buf = c.createBuffer(1, Math.floor(c.sampleRate * len), c.sampleRate);
      const ch = buf.getChannelData(0);
      for (let i = 0; i < ch.length; i++) ch[i] = (Math.random() * 2 - 1) * (1 - i / ch.length);
      const src = c.createBufferSource();
      src.buffer = buf;
      const filter = c.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(600, t);
      filter.frequency.exponentialRampToValueAtTime(2400, t + len);
      const g = c.createGain();
      g.gain.value = 0.06;
      src.connect(filter).connect(g).connect(c.destination);
      src.start(t);
    }),
  good: () =>
    play((c, t) => {
      bar(c, 523, t, 0.08);
      bar(c, 784, t + 0.06, 0.08);
    }),
  again: () =>
    play((c, t) => {
      bar(c, 392, t, 0.07, 0.3);
      bar(c, 330, t + 0.1, 0.07, 0.35);
    }),
  win: () =>
    play((c, t) => {
      [523, 659, 784, 1046, 1318].forEach((f, i) => bar(c, f, t + i * 0.08, 0.1, 0.6));
    }),
};
