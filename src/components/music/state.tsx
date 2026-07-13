"use client";

/**
 * THE MUSIC ROOM — gate + vault + playback deck state.
 *
 * Gate resolution happens client-side after mount (SSR renders the neutral
 * resolving shell, so there is never a hydration mismatch):
 *   released            → open for everyone
 *   v2 claim in storage → tenant: full room, unlockAlbum({deedId, tenantKey})
 *   ?asif=released      → DEV ONLY page-view preview (never in production)
 *   v1 claim only       → locked ("your key predates the wall")
 *   nothing             → locked (anonymous)
 * This resolution touches ONLY localStorage + the clock — zero network — so a
 * passive page load never emits a failed request.
 *
 * The vault (signed playback URLs) is fan-gate, not DRM, and is opened ONLY on
 * explicit user intent (pressing a reel, or "open the vault") — never on load.
 * That keeps a passive visit network-silent (clean console everywhere) and only
 * reaches for Supabase when someone actually wants to listen. Signed URLs
 * expire (~1h); the deck transparently re-unlocks and resumes on expiry/error.
 * An empty masters bucket is a real, honest state: the deck reports "masters
 * incoming" and lights up with no code change once files land.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { TRACKS, msUntilRelease } from "@/lib/album";
import { unlockAlbum, BackendError } from "@/lib/backend";
import { trackBySlug } from "./data";

/* ------------------------------------------------------------------ */
/* Types                                                                */
/* ------------------------------------------------------------------ */

export type LockedReason = "anon" | "v1" | "invalid" | "offline";

export type GateState =
  | { phase: "resolving" }
  | { phase: "locked"; reason: LockedReason }
  | { phase: "open"; mode: "tenant" | "released" | "preview" };

/**
 * idle    — vault not yet opened (no network touched; awaiting intent)
 * opening — unlock in flight
 * empty   — unlock succeeded, masters bucket empty ("masters incoming")
 * ready   — signed URLs on hand
 * sealed  — dev preview only: page view granted, playback not (401/offline)
 * error   — network/server failure at open time ("the vault isn't answering")
 */
export type VaultState = "idle" | "opening" | "empty" | "ready" | "sealed" | "error";

interface TenantClaim {
  alias: string;
  deedId: string;
  tenantNumber: number;
  tenantKey: string;
}

interface MusicCtx {
  gate: GateState;
  vault: VaultState;
  tenant: TenantClaim | null;
  /** Album-order tracks with a live signed URL. */
  playable: string[];
  current: string | null;
  playing: boolean;
  time: number;
  duration: number;
  /** Press a reel: opens the vault on first intent, then plays if a master exists. */
  play: (slug: string) => void;
  /** Explicit "open the vault" — arms playback without targeting a reel. */
  openVault: () => void;
  toggle: () => void;
  seek: (t: number) => void;
  next: () => void;
  prev: () => void;
  /** Re-resolve the gate (used by the offline gate's "knock again"). */
  retry: () => void;
  /** Re-attempt an errored vault open, staying in the room. */
  retryVault: () => void;
}

const Ctx = createContext<MusicCtx | null>(null);

export function useMusic(): MusicCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error("useMusic outside MusicProvider");
  return v;
}

/* ------------------------------------------------------------------ */
/* Claim storage                                                        */
/* ------------------------------------------------------------------ */

const V2_KEY = "uc:key-claim:v2";
const V1_KEY = "uc:key-claim:v1";

function readClaims(): { v2: TenantClaim | null; hasV1: boolean } {
  let v2: TenantClaim | null = null;
  let hasV1 = false;
  try {
    const raw = window.localStorage.getItem(V2_KEY);
    if (raw) {
      const c = JSON.parse(raw) as Partial<TenantClaim>;
      if (
        typeof c.alias === "string" &&
        typeof c.deedId === "string" &&
        typeof c.tenantKey === "string" &&
        typeof c.tenantNumber === "number"
      ) {
        v2 = {
          alias: c.alias,
          deedId: c.deedId,
          tenantKey: c.tenantKey,
          tenantNumber: c.tenantNumber,
        };
      }
    }
    if (!v2) hasV1 = window.localStorage.getItem(V1_KEY) !== null;
  } catch {
    /* storage unavailable → treated as anonymous */
  }
  return { v2, hasV1 };
}

/* ------------------------------------------------------------------ */
/* Provider                                                             */
/* ------------------------------------------------------------------ */

export function MusicProvider({ children }: { children: ReactNode }) {
  const [gate, setGate] = useState<GateState>({ phase: "resolving" });
  const [vault, setVault] = useState<VaultState>("idle");
  const [tenant, setTenant] = useState<TenantClaim | null>(null);
  const [tracks, setTracks] = useState<Record<string, string>>({});
  const [current, setCurrent] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const tracksRef = useRef<Record<string, string>>({});
  const unlockMeta = useRef<{ at: number; ttl: number }>({ at: 0, ttl: 0 });
  const unlockInFlight = useRef<Promise<Record<string, string> | null> | null>(null);
  const tenantRef = useRef<TenantClaim | null>(null);
  const gateRef = useRef<GateState>(gate);
  const vaultRef = useRef<VaultState>(vault);
  const pendingPlay = useRef<string | null>(null);
  const lastRecover = useRef(0);
  const wantedPlay = useRef(false);
  gateRef.current = gate;
  vaultRef.current = vault;

  /* ---------------- gate resolution (client-only, no network) ---------------- */

  const resolveGate = useCallback(() => {
    const released = msUntilRelease(Date.now()) <= 0;
    const { v2, hasV1 } = readClaims();
    setTenant(v2);
    tenantRef.current = v2;
    if (released) {
      setGate({ phase: "open", mode: "released" });
      return;
    }
    if (v2) {
      setGate({ phase: "open", mode: "tenant" });
      return;
    }
    if (
      process.env.NODE_ENV === "development" &&
      typeof window !== "undefined" &&
      new URLSearchParams(window.location.search).get("asif") === "released"
    ) {
      setGate({ phase: "open", mode: "preview" });
      return;
    }
    setGate({ phase: "locked", reason: hasV1 ? "v1" : "anon" });
  }, []);

  useEffect(() => {
    // Small delay keeps the shimmer legible instead of a flash.
    const id = window.setTimeout(resolveGate, 60);
    return () => window.clearTimeout(id);
  }, [resolveGate]);

  /* ---------------- vault unlock (ONLY on explicit intent) ---------------- */

  const runUnlock = useCallback(async (): Promise<Record<string, string> | null> => {
    if (unlockInFlight.current) return unlockInFlight.current;
    const g = gateRef.current;
    if (g.phase !== "open") return null;
    const mode = g.mode;
    const t = tenantRef.current;
    const p = (async () => {
      try {
        const res = await unlockAlbum(
          t ? { deedId: t.deedId, tenantKey: t.tenantKey } : undefined,
        );
        unlockMeta.current = { at: Date.now(), ttl: res.ttl };
        tracksRef.current = res.tracks;
        setTracks(res.tracks);
        setVault(Object.keys(res.tracks).length > 0 ? "ready" : "empty");
        return res.tracks;
      } catch (e) {
        const lockedOut = e instanceof BackendError && e.code === "locked";
        if (mode === "preview") {
          // Dev preview grants the page view only — report honestly, keep the room.
          setVault("sealed");
        } else if (lockedOut) {
          // A key the vault refuses (fake/expired tenantKey) → back to the door.
          setVault("idle");
          setGate({ phase: "locked", reason: "invalid" });
        } else {
          // Network / server failure → the vault isn't answering (inline, stay in room).
          setVault("error");
        }
        return null;
      } finally {
        unlockInFlight.current = null;
      }
    })();
    unlockInFlight.current = p;
    return p;
  }, []);

  /** Explicit intent to open the vault. No-op once armed. */
  const openVault = useCallback(() => {
    if (gateRef.current.phase !== "open") return;
    const v = vaultRef.current;
    if (v === "opening" || v === "empty" || v === "ready" || v === "sealed") return;
    setVault("opening");
    void runUnlock();
  }, [runUnlock]);

  const retryVault = useCallback(() => {
    if (vaultRef.current === "opening") return;
    setVault("opening");
    unlockMeta.current = { at: 0, ttl: 0 };
    void runUnlock();
  }, [runUnlock]);

  const retry = useCallback(() => {
    setVault("idle");
    setGate({ phase: "resolving" });
    window.setTimeout(resolveGate, 450);
  }, [resolveGate]);

  /* ---------------- playback deck ---------------- */

  const ensureAudio = useCallback((): HTMLAudioElement => {
    if (audioRef.current) return audioRef.current;
    const a = new Audio();
    a.preload = "metadata";
    a.addEventListener("timeupdate", () => setTime(a.currentTime));
    a.addEventListener("durationchange", () => {
      setDuration(Number.isFinite(a.duration) ? a.duration : 0);
    });
    a.addEventListener("play", () => setPlaying(true));
    a.addEventListener("pause", () => setPlaying(false));
    audioRef.current = a;
    return a;
  }, []);

  /** Fresh signed URL for a slug, transparently re-unlocking near expiry. */
  const freshUrl = useCallback(
    async (slug: string): Promise<string | null> => {
      const { at, ttl } = unlockMeta.current;
      const stale = at === 0 || Date.now() - at > Math.max(0, ttl - 90) * 1000;
      if (stale) {
        const t = await runUnlock();
        return t?.[slug] ?? null;
      }
      return tracksRef.current[slug] ?? null;
    },
    [runUnlock],
  );

  const startTrack = useCallback(
    async (slug: string, resumeAt = 0) => {
      const url = await freshUrl(slug);
      if (!url) return; // nothing in the vault for this reel — UI already says so
      const a = ensureAudio();
      wantedPlay.current = true;
      setCurrent(slug);
      setTime(resumeAt);
      setDuration(0);
      a.src = url;
      if (resumeAt > 0) a.currentTime = resumeAt;
      try {
        await a.play();
      } catch {
        // Autoplay policy or transient abort — deck stays paused, no error surfaced.
        setPlaying(false);
      }
    },
    [ensureAudio, freshUrl],
  );

  const play = useCallback(
    (slug: string) => {
      const a = audioRef.current;
      // Already loaded this reel → toggle.
      if (current === slug && a) {
        if (a.paused) void a.play().catch(() => setPlaying(false));
        else a.pause();
        return;
      }
      // A live master is on hand → play it now.
      if (tracksRef.current[slug]) {
        void startTrack(slug);
        return;
      }
      // Not armed yet → this press IS the intent: open the vault, remember the reel.
      const v = vaultRef.current;
      if (v === "idle" || v === "error") {
        pendingPlay.current = slug;
        setVault("opening");
        void runUnlock().then((t) => {
          const target = pendingPlay.current;
          pendingPlay.current = null;
          if (target && t?.[target]) void startTrack(target);
        });
      }
      // vault empty/sealed/opening with no URL for this reel → UI shows "incoming".
    },
    [current, startTrack, runUnlock],
  );

  const toggle = useCallback(() => {
    const a = audioRef.current;
    if (!a || !current) return;
    if (a.paused) void a.play().catch(() => setPlaying(false));
    else a.pause();
  }, [current]);

  const seek = useCallback((t: number) => {
    const a = audioRef.current;
    if (!a || !Number.isFinite(t)) return;
    a.currentTime = Math.max(0, Math.min(t, a.duration || t));
    setTime(a.currentTime);
  }, []);

  const playable = useMemo(
    () => TRACKS.filter((t) => tracks[t.slug]).map((t) => t.slug),
    [tracks],
  );
  const playableRef = useRef(playable);
  playableRef.current = playable;
  const currentRef = useRef(current);
  currentRef.current = current;

  const step = useCallback(
    (dir: 1 | -1) => {
      const list = playableRef.current;
      const cur = currentRef.current;
      if (list.length === 0) return;
      const i = cur ? list.indexOf(cur) : -1;
      const nextIdx =
        i === -1 ? (dir === 1 ? 0 : list.length - 1) : (i + dir + list.length) % list.length;
      void startTrack(list[nextIdx]);
    },
    [startTrack],
  );
  const next = useCallback(() => step(1), [step]);
  const prev = useCallback(() => step(-1), [step]);

  /* ended → advance; error → transparent re-unlock + resume */
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const onEnded = () => {
      const list = playableRef.current;
      const cur = currentRef.current;
      const i = cur ? list.indexOf(cur) : -1;
      if (i !== -1 && i < list.length - 1) void startTrack(list[i + 1]);
      else setPlaying(false);
    };
    const onError = () => {
      // Signed URL likely expired mid-session: re-unlock once, resume in place.
      const cur = currentRef.current;
      if (!cur) return;
      const nowT = Date.now();
      if (nowT - lastRecover.current < 15000) {
        setPlaying(false);
        return;
      }
      lastRecover.current = nowT;
      const resumeAt = a.currentTime || 0;
      unlockMeta.current = { at: 0, ttl: 0 }; // force refresh
      if (wantedPlay.current) void startTrack(cur, resumeAt);
    };
    a.addEventListener("ended", onEnded);
    a.addEventListener("error", onError);
    return () => {
      a.removeEventListener("ended", onEnded);
      a.removeEventListener("error", onError);
    };
  }, [current, startTrack]);

  /* pause bookkeeping for the recover guard */
  useEffect(() => {
    if (!playing) return;
    wantedPlay.current = true;
    return () => {
      const a = audioRef.current;
      if (a?.paused) wantedPlay.current = false;
    };
  }, [playing]);

  /* teardown */
  useEffect(() => {
    return () => {
      const a = audioRef.current;
      if (a) {
        a.pause();
        a.removeAttribute("src");
      }
      audioRef.current = null;
    };
  }, []);

  /* document title carries the now-playing reel */
  useEffect(() => {
    if (!playing || !current) return;
    const t = trackBySlug(current);
    if (!t) return;
    const before = document.title;
    document.title = `▶ ${t.title} — Underdog City`;
    return () => {
      document.title = before;
    };
  }, [playing, current]);

  const value = useMemo<MusicCtx>(
    () => ({
      gate,
      vault,
      tenant,
      playable,
      current,
      playing,
      time,
      duration,
      play,
      openVault,
      toggle,
      seek,
      next,
      prev,
      retry,
      retryVault,
    }),
    [
      gate,
      vault,
      tenant,
      playable,
      current,
      playing,
      time,
      duration,
      play,
      openVault,
      toggle,
      seek,
      next,
      prev,
      retry,
      retryVault,
    ],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

/** prefers-reduced-motion, client-side; false during SSR/first paint. */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return reduced;
}
