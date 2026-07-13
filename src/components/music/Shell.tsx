"use client";

import type { ReactNode } from "react";
import Gate, { Resolving } from "./Gate";
import PlayerBar from "./PlayerBar";
import { MusicProvider, useMusic } from "./state";
import "./music.css";

/**
 * Shared shell for every /music route: one provider (gate + vault + deck)
 * that persists across the music pages, so the now-playing bar and the
 * playback element survive client-side navigation between the shelf and
 * the reels.
 */
export default function MusicShell({ children }: { children: ReactNode }) {
  return (
    <MusicProvider>
      <GateSwitch>{children}</GateSwitch>
    </MusicProvider>
  );
}

function GateSwitch({ children }: { children: ReactNode }) {
  const { gate } = useMusic();
  if (gate.phase === "resolving") return <Resolving />;
  if (gate.phase === "locked") return <Gate reason={gate.reason} />;
  return (
    <div className="mu-root">
      {children}
      <PlayerBar />
    </div>
  );
}
