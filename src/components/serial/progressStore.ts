/**
 * Per-chapter reading progress, persisted to localStorage.
 * Client-only: every function must be called after mount. All access is
 * wrapped in try/catch so private-mode / blocked storage degrades silently.
 */

const KEY = "uc:serial-progress:v1";

export interface ChapterProgress {
  /** Read fraction of the chapter document, 0..1. */
  f: number;
  /** Epoch ms of the last save. */
  at: number;
}

type Store = Record<string, ChapterProgress>;

function readAll(): Store {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Store;
    }
    return {};
  } catch {
    return {};
  }
}

export function readChapterProgress(slug: string): ChapterProgress | null {
  const entry = readAll()[slug];
  if (
    entry &&
    typeof entry.f === "number" &&
    Number.isFinite(entry.f) &&
    entry.f >= 0 &&
    entry.f <= 1
  ) {
    return entry;
  }
  return null;
}

export function writeChapterProgress(slug: string, f: number): void {
  try {
    const all = readAll();
    all[slug] = { f: Math.min(1, Math.max(0, f)), at: Date.now() };
    window.localStorage.setItem(KEY, JSON.stringify(all));
  } catch {
    // Storage unavailable — progress just isn't remembered.
  }
}
