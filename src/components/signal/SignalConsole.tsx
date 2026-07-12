"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { BRAND } from "@/lib/album";
import { CHANNELS, padCh } from "./data";
import BootSequence from "./BootSequence";
import ChannelDial from "./ChannelDial";
import ChannelCard from "./ChannelCard";
import Ticker from "./Ticker";
import { KintsugiCrack } from "./Kintsugi";
import { SignalAudio } from "./audio";
import "./signal.css";

function Meter({ ch }: { ch: number }) {
  const bars = ch === 0 ? 1 : 3 + (ch % 3);
  return (
    <span className="sig-meter" role="img" aria-label={`Signal strength ${bars} of 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <b key={i} className={i < bars ? "on" : ""} style={{ height: `${6 + i * 3}px` }} />
      ))}
    </span>
  );
}

export default function SignalConsole() {
  const [phase, setPhase] = useState<"idle" | "boot" | "live">("idle");
  const [reduced, setReduced] = useState(false);
  const [ch, setCh] = useState(2); // CH 02 — "Down Here", the city anthem, greets first
  const [tuneStamp, setTuneStamp] = useState(0);
  const [burst, setBurst] = useState(false);
  const [buf, setBuf] = useState("");
  const [deny, setDeny] = useState(false);
  const [audioOn, setAudioOn] = useState(false);
  const [clock, setClock] = useState("--:--:--");

  const audioRef = useRef<SignalAudio | null>(null);
  const chRef = useRef(ch);
  const bufRef = useRef("");
  const reducedRef = useRef(false);
  const burstT = useRef(0);
  const bufT = useRef(0);
  const denyT = useRef(0);

  // Reduced-motion + boot gate (client only — no hydration divergence).
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      setReduced(mq.matches);
      reducedRef.current = mq.matches;
    };
    sync();
    mq.addEventListener("change", sync);
    setPhase("boot");
    return () => mq.removeEventListener("change", sync);
  }, []);

  // Console clock (client only).
  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setClock(
        [d.getHours(), d.getMinutes(), d.getSeconds()]
          .map((v) => String(v).padStart(2, "0"))
          .join(":")
      );
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  const selectChannel = useCallback((n: number) => {
    bufRef.current = "";
    setBuf("");
    window.clearTimeout(bufT.current);
    if (chRef.current === n) return;
    chRef.current = n;
    setCh(n);
    setTuneStamp((s) => s + 1);
    audioRef.current?.tune(n);
    if (!reducedRef.current) {
      setBurst(true);
      window.clearTimeout(burstT.current);
      burstT.current = window.setTimeout(() => setBurst(false), 420);
    }
  }, []);

  const commitBuf = useCallback(
    (b: string) => {
      bufRef.current = "";
      setBuf("");
      if (!b) return;
      const n = parseInt(b, 10);
      if (Number.isInteger(n) && n >= 0 && n <= 14) {
        selectChannel(n);
      } else {
        setDeny(true);
        window.clearTimeout(denyT.current);
        denyT.current = window.setTimeout(() => setDeny(false), 750);
      }
    },
    [selectChannel]
  );

  const pushDigit = useCallback(
    (d: string) => {
      const next = (bufRef.current + d).slice(-2);
      bufRef.current = next;
      setBuf(next);
      window.clearTimeout(bufT.current);
      bufT.current = window.setTimeout(
        () => commitBuf(next),
        next.length >= 2 ? 240 : 900
      );
    },
    [commitBuf]
  );

  // Keyboard tuning: arrows step the dial, digits dial a channel directly.
  useEffect(() => {
    if (phase !== "live") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "ArrowDown" || e.key === "ArrowRight") {
        e.preventDefault();
        selectChannel((chRef.current + 1) % 15);
      } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
        e.preventDefault();
        selectChannel((chRef.current + 14) % 15);
      } else if (/^\d$/.test(e.key)) {
        pushDigit(e.key);
      } else if (e.key === "Enter" && bufRef.current) {
        e.preventDefault();
        const b = bufRef.current;
        window.clearTimeout(bufT.current);
        commitBuf(b);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, selectChannel, pushDigit, commitBuf]);

  const toggleAudio = useCallback(async () => {
    if (!audioOn) {
      try {
        if (!audioRef.current) audioRef.current = new SignalAudio();
        await audioRef.current.start(chRef.current);
        setAudioOn(true);
      } catch {
        // WebAudio unavailable — toggle stays off.
      }
    } else {
      audioRef.current?.stop();
      setAudioOn(false);
    }
  }, [audioOn]);

  useEffect(() => {
    return () => {
      audioRef.current?.dispose();
      audioRef.current = null;
    };
  }, []);

  const channel = CHANNELS[ch];

  return (
    <div className="sig-root">
      <h1 className="sig-vh">
        THE SIGNAL — pirate broadcast console. Fourteen channels hijacked from a
        Halo frequency, broadcasting Throne at the Bottom from Underdog City.
      </h1>

      {/* CRT furniture */}
      <div className="sig-scanlines" aria-hidden />
      <div className="sig-scanbar" aria-hidden />
      <div className="sig-vignette" aria-hidden />
      <div className={`sig-glitch${burst ? " on" : ""}`} aria-hidden />
      <KintsugiCrack className="sig-kintsugi" />
      <aside className="sig-margin" aria-hidden>
        CENOTAPH RECORDS ▪ REL {BRAND.releaseDateDisplay} ▪ BAND BELOW-FM ▪ RX 14 + 1 GHOST
      </aside>
      <aside className="sig-txtag" aria-hidden>
        TX: THE BOTTOM → EVERYWHERE
      </aside>

      <header className="sig-head">
        <div className="sig-head-row">
          <div className="sig-brand">
            <span className="sig-brand-name">◍ CENOTAPH RELAY</span>
            <span className="sig-brand-sub">PIRATE CARRIER — SIXTY LEVELS UNDER THE HALO</span>
          </div>
          <div className="sig-head-mid">
            <span className={`sig-tune${deny ? " deny" : ""}`} aria-live="polite">
              {deny
                ? "NO CARRIER"
                : buf
                  ? `TUNING ▸ ${buf}█`
                  : `RX CH ${padCh(ch)} — LOCKED`}
            </span>
            <Meter ch={ch} />
            <span className="sig-clock" aria-label="Local time">
              {clock}
            </span>
            <button
              type="button"
              className="sig-audio"
              aria-pressed={audioOn}
              aria-label={`Synthesized drone audio, currently ${audioOn ? "on" : "off"}`}
              onClick={toggleAudio}
            >
              <span className="dot" aria-hidden />
              AUDIO {audioOn ? "ON" : "OFF"}
            </button>
          </div>
        </div>
        <Ticker />
      </header>

      <main className="sig-main">
        <ChannelDial current={ch} onSelect={selectChannel} />
        <div className="sig-stage">
          <ChannelCard channel={channel} tuneStamp={tuneStamp} reduced={reduced} />
        </div>
      </main>

      <p className="sig-vh" aria-live="polite">
        {channel.track
          ? `Channel ${padCh(ch)} locked — ${channel.track.title}`
          : "Channel 00 — ghost carrier, signal lost"}
      </p>

      {phase === "boot" && (
        <BootSequence reduced={reduced} onDone={() => setPhase("live")} />
      )}
    </div>
  );
}
