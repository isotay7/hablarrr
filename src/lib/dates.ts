/** Local calendar date as YYYY-MM-DD. */
export function dayKey(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function addDays(d: Date, n: number): Date {
  const out = new Date(d);
  out.setDate(out.getDate() + n);
  return out;
}

/** ISO 8601 week id, e.g. 2026-W42. */
export function isoWeek(d = new Date()): string {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${date.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

/** Last 7 local days, oldest first, as {key, label}. Labels are Spanish weekday initials. */
export function lastSevenDays(today = new Date()) {
  const initials = ["D", "L", "M", "M", "J", "V", "S"];
  return Array.from({ length: 7 }, (_, i) => {
    const d = addDays(today, i - 6);
    return { key: dayKey(d), label: initials[d.getDay()], isToday: i === 6 };
  });
}

export function greeting(d = new Date()): { es: string; en: string } {
  const h = d.getHours();
  if (h < 12) return { es: "Buenos días", en: "Good morning" };
  if (h < 19) return { es: "Buenas tardes", en: "Good afternoon" };
  return { es: "Buenas noches", en: "Good evening" };
}
