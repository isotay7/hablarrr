"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/Icon";
import { Kicker, Loading, RoundButton } from "@/components/ui";
import { dayKey } from "@/lib/dates";
import type { Settings } from "@/lib/db";
import { onVoicesChanged, pickVoice, speak, spanishVoices, speechSupported } from "@/lib/speech";
import { sfx } from "@/lib/sounds";
import { useStore } from "@/lib/store";
import { characters } from "@/content";
import { DEFAULT_NAMES, ROLE_LABELS, ROLES, type Names } from "@/content/people";

export default function SettingsPage() {
  const { ready, data, updateSettings, exportJSON, importJSON, startHereDone } = useStore();
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const file = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!speechSupported()) return;
    const load = () => setVoices(spanishVoices());
    const t = setTimeout(load, 0);
    const off = onVoicesChanged(load);
    return () => {
      clearTimeout(t);
      off();
    };
  }, []);

  if (!ready) return <Loading />;
  const s = data.settings;
  const current = pickVoice(s.voiceURI);

  const set = (patch: Partial<Settings>) => {
    sfx.tap();
    updateSettings(patch);
  };

  const download = () => {
    const blob = new Blob([exportJSON()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `hablarrr-backup-${dayKey()}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    setMsg("Backup saved. On iPad it goes to the Files app → Downloads.");
  };

  const restore = async (f: File) => {
    try {
      await importJSON(await f.text());
      setMsg("Backup restored.");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Couldn’t read that file.");
    }
  };

  return (
    <div className="no-scrollbar h-full overflow-y-auto">
      <div className="pt-safe mx-auto flex max-w-2xl flex-col gap-6 px-5 pb-12 pt-6 sm:px-8">
        <header className="flex items-center gap-3 pt-4">
          <RoundButton icon="back" label="Back" href="/progreso" />
          <div>
            <Kicker className="text-accent-text">Ajustes</Kicker>
            <h1 className="font-display text-4xl font-bold">Settings</h1>
          </div>
        </header>

        <NamesGroup saved={s.names} onSave={(names) => set({ names })} />

        <Group title="Look and sound">
          <Row label="Theme" hint="Night mode is easier on the eyes in bed.">
            <Segmented
              value={s.theme}
              options={[
                ["night", "Night"],
                ["light", "Light"],
              ]}
              onChange={(v) => set({ theme: v })}
            />
          </Row>
          <Row label="Sound effects" hint="Soft taps and chimes.">
            <Segmented
              value={s.sound ? "on" : "off"}
              options={[
                ["on", "On"],
                ["off", "Off"],
              ]}
              onChange={(v) => set({ sound: v === "on" })}
            />
          </Row>
          <Row
            label="Solo español"
            hint={
              startHereDone
                ? "Hide English translations and notes everywhere. Word meanings stay one tap away."
                : "Unlocks after you finish all 50 Start Here phrases. Until then, English helps."
            }
          >
            {startHereDone ? (
            <Segmented
              value={s.spanishOnly ? "on" : "off"}
              options={[
                ["off", "Off"],
                ["on", "On"],
              ]}
              onChange={(v) => set({ spanishOnly: v === "on" })}
            />
            ) : (
              <span className="flex h-11 items-center gap-2 rounded-full bg-bg px-4 text-[15px] font-bold text-muted">
                <Icon name="lock" size={16} strokeWidth={2.4} /> Locked
              </span>
            )}
          </Row>
          <Row label="Daily goal" hint="Minutes per day for your ring.">
            <Segmented
              value={String(s.dailyGoalMinutes)}
              options={[
                ["10", "10"],
                ["15", "15"],
                ["20", "20"],
                ["30", "30"],
              ]}
              onChange={(v) => set({ dailyGoalMinutes: Number(v) })}
            />
          </Row>
        </Group>

        <Group title="Voice">
          {!speechSupported() ? (
            <p className="text-muted">This browser can’t speak. Try Safari on your iPad.</p>
          ) : (
            <>
              <p className="text-[15px] leading-snug text-muted">
                For the best Mexican voice on iPad: Settings → Accessibility → Spoken Content → Voices → Spanish →
                Spanish (Mexico), then download an <b>Enhanced</b> voice. It shows up here after a restart of the app.
              </p>
              {voices.length === 0 && <p className="text-muted">No Spanish voices found yet.</p>}
              <ul className="flex flex-col gap-2">
                {voices.map((v) => {
                  const on = current?.voiceURI === v.voiceURI;
                  return (
                    <li key={v.voiceURI}>
                      <button
                        type="button"
                        onClick={() => {
                          set({ voiceURI: v.voiceURI });
                          speak(`¡Hola, ${characters.me.name}! Mucho gusto.`, { speed: s.speed, voiceURI: v.voiceURI });
                        }}
                        aria-pressed={on}
                        className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3.5 text-left ${
                          on ? "border-accent bg-learn" : "border-line bg-card"
                        }`}
                      >
                        <Icon name="speaker" size={20} className="text-accent-text" />
                        <span className="flex-1">
                          <span className="font-bold">{v.name}</span> <span className="text-muted">· {v.lang}</span>
                        </span>
                        {on && <Icon name="check" size={20} strokeWidth={3} className="text-accent-text" />}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </Group>

        <Group title="Backup">
          <p className="text-[15px] leading-snug text-muted">
            Your progress lives only on this device for now. Save a backup now and then. Syncing between iPad and iPhone
            comes in Phase 3.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={download}
              className="h-12 rounded-full bg-accent px-5 font-bold text-accent-ink active:scale-95"
            >
              Save backup
            </button>
            <button
              type="button"
              onClick={() => file.current?.click()}
              className="h-12 rounded-full border border-line px-5 font-bold active:scale-95"
            >
              Restore from file
            </button>
            <input
              ref={file}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f && confirm("Replace everything on this device with this backup?")) void restore(f);
                e.target.value = "";
              }}
            />
          </div>
          {msg && (
            <p role="status" className="text-[15px] font-semibold text-accent-text">
              {msg}
            </p>
          )}
        </Group>
      </div>
    </div>
  );
}

function NamesGroup({ saved, onSave }: { saved: Partial<Names>; onSave: (names: Partial<Names>) => void }) {
  const [draft, setDraft] = useState<Partial<Names>>(saved);
  const changed = ROLES.some((r) => (draft[r] ?? "").trim() !== (saved[r] ?? "").trim());

  return (
    <Group title="Nombres">
      <p className="text-[15px] leading-snug text-muted">
        The dialogues use these names. They stay on this device and never go to GitHub or anywhere else.
      </p>
      <form
        className="flex flex-col gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          const clean: Partial<Names> = {};
          for (const r of ROLES) if (draft[r]?.trim()) clean[r] = draft[r]!.trim();
          onSave(clean);
        }}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {ROLES.map((r) => (
            <label key={r} className="flex flex-col gap-1.5">
              <span className="text-[15px] font-bold">{ROLE_LABELS[r]}</span>
              <input
                id={`name-${r}`}
                value={draft[r] ?? ""}
                placeholder={DEFAULT_NAMES[r]}
                autoComplete="off"
                autoCapitalize="words"
                onChange={(e) => setDraft({ ...draft, [r]: e.target.value })}
                className="h-12 rounded-2xl border border-line bg-bg px-4 text-[17px] outline-none focus:border-accent"
              />
            </label>
          ))}
        </div>
        <button
          type="submit"
          disabled={!changed}
          className="h-12 self-start rounded-full bg-accent px-5 font-bold text-accent-ink active:scale-95 disabled:opacity-40"
        >
          Save names
        </button>
      </form>
    </Group>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4 rounded-[28px] bg-surface p-5">
      <h2 className="font-display text-2xl font-bold">{title}</h2>
      {children}
    </section>
  );
}

function Row({ label, hint, children }: { label: string; hint: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="font-bold">{label}</div>
        <div className="text-[15px] text-muted">{hint}</div>
      </div>
      {children}
    </div>
  );
}

function Segmented<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: [T, string][];
  onChange: (v: T) => void;
}) {
  return (
    <div role="group" className="flex shrink-0 rounded-full bg-bg p-1">
      {options.map(([v, label]) => (
        <button
          key={v}
          type="button"
          aria-pressed={value === v}
          onClick={() => onChange(v)}
          className={`h-11 min-w-16 rounded-full px-4 text-[15px] font-bold transition-colors ${
            value === v ? "bg-accent text-accent-ink" : "text-text"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
