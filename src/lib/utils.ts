import { formatDistanceToNow, format, parseISO, differenceInCalendarDays } from "date-fns";

/** Tailwind-aware className combiner. */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

/** Deterministic PRNG so the demo seed is reproducible. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function pick<T>(rng: () => number, arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

export function pickN<T>(rng: () => number, arr: readonly T[], n: number): T[] {
  const copy = [...arr];
  const out: T[] = [];
  while (copy.length && out.length < n) {
    out.push(copy.splice(Math.floor(rng() * copy.length), 1)[0]);
  }
  return out;
}

export function randInt(rng: () => number, min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

export function truncate(s: string, n: number): string {
  return s.length > n ? s.slice(0, n - 1).trimEnd() + "…" : s;
}

export function titleCase(s: string): string {
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}

// ── Dates ───────────────────────────────────────────────────────────────────

export const fmtDate = (d: Date | string) => format(typeof d === "string" ? parseISO(d) : d, "MMM d, yyyy");
export const fmtDateShort = (d: Date | string) => format(typeof d === "string" ? parseISO(d) : d, "MMM d");
export const fmtDateMed = (d: Date | string) => format(typeof d === "string" ? parseISO(d) : d, "EEE, MMM d");
export const fmtDateTime = (d: Date | string) => format(typeof d === "string" ? parseISO(d) : d, "MMM d, HH:mm");

export function timeAgo(d: Date | string): string {
  return formatDistanceToNow(typeof d === "string" ? parseISO(d) : d, { addSuffix: true });
}

export function isToday(d: Date): boolean {
  return differenceInCalendarDays(new Date(), d) === 0;
}

export function daysAgo(days: number, from = new Date(), hoursJitter = 0): Date {
  const d = new Date(from);
  d.setDate(d.getDate() - days);
  d.setHours(9 + (hoursJitter % 12), (hoursJitter * 37) % 60, 0, 0);
  return d;
}

export function startOfDayUTC(d: Date): Date {
  const out = new Date(d);
  out.setHours(0, 0, 0, 0);
  return out;
}

/** Human-friendly "last X days" bucket for timeline headers. */
export function dayBucketLabel(d: Date): string {
  const diff = differenceInCalendarDays(new Date(), d);
  if (diff <= 0) return "Today";
  if (diff === 1) return "Yesterday";
  return fmtDate(d);
}

export function relativeDay(d: Date | string): number {
  return differenceInCalendarDays(new Date(), typeof d === "string" ? parseISO(d) : d);
}

export function dayKey(d: Date): string {
  return format(d, "yyyy-MM-dd");
}

export function parseDayKey(key: string): Date {
  return parseISO(key);
}

export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

export function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}k`;
  return `${n}`;
}

export function formatPricePerM(n?: number | null, digits = 2): string {
  if (n == null) return "—";
  if (n >= 1) return `$${n.toFixed(2)}`;
  return `$${n.toFixed(digits)}`;
}

/** Read a JSON column with a safe fallback. */
export function asArray<T = unknown>(v: unknown): T[] {
  return Array.isArray(v) ? (v as T[]) : [];
}

export function asObject<T = Record<string, unknown>>(v: unknown): T {
  return v && typeof v === "object" && !Array.isArray(v) ? (v as T) : ({} as T);
}

export function asString(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : fallback;
}

export function asBool(v: unknown): boolean {
  return v === true;
}
