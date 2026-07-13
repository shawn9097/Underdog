/**
 * CHAPTER 0 — CAME BACK WRONG.
 *
 * The locked Season-1 prologue (PROLOGUE in @/lib/album, 29 verbatim
 * paragraphs) staged for the chapter reader. The beat map below is verified
 * line-by-line against docs/underdog-city-brief.md Appendix A — treatments
 * only; the text is always read verbatim from PROLOGUE at render time.
 */

import { BRAND, PROLOGUE, TRACKS } from "@/lib/album";
import type { BeatDef, ChapterReaderConfig } from "./beats";

const TRACK = TRACKS[11]; // Came Back Wrong — the chapter's scored track.

/** Treatment per PROLOGUE index (0–28). 28 (the finale line) is rendered by <Finale/>. */
export const CHAPTER_ZERO_BEATS: BeatDef[] = [
  { i: 0, t: "body" }, // "I've got maybe a minute of blood left in me..."
  { i: 1, t: "dialogue" }, // "Run," I tell her. "I'm fine. Go."
  { i: 2, t: "body" }, // "...service corridor sixty levels under the Halo..."
  { i: 3, t: "dialogue" }, // "Go. Before the bell stops ringing."
  { i: 4, t: "bell" }, // "...the Halo is ringing its victory bell."
  { i: 5, t: "body" }, // "The man with the clean boots is already gone..."
  { i: 6, t: "body" }, // "She's crying..."
  { i: 7, t: "body" }, // "Listen to me." ...voice going wrong
  { i: 8, t: "fracture" }, // "...cracks straight down the middle."
  { i: 9, t: "body" }, // "I made her a promise once..."
  { i: 10, t: "body" }, // "I'm about to break that promise..."
  { i: 11, t: "body" }, // "She takes my hand. Presses something into it..."
  { i: 12, t: "dialogue" }, // "Hold on," she whispers. "Please. Just hold on."
  { i: 13, t: "body" }, // "I want to. God help me, I want to."
  {
    i: 14,
    t: "fade",
    anchor: "fade",
    dissolveFrom: "dissolving like a word said too many times—",
  },
  { i: 15, t: "death", anchor: "death" }, // "—and then there's nothing."
  { i: 16, t: "void", scale: 1 }, // "And the nothing is almost a mercy."
  { i: 17, t: "void", scale: 1 }, // "So that's it, I think. That's dying..."
  { i: 18, t: "beat", scale: 1.15 }, // "I'm wrong."
  { i: 19, t: "void", scale: 1 }, // "Here's what nobody tells you about the bottom..."
  { i: 20, t: "void", scale: 1 }, // "Something moves behind my ribs..."
  { i: 21, t: "ignite", anchor: "return" }, // "Something gold. And patient. And very, very angry."
  { i: 22, t: "return" }, // "I don't remember my name..."
  { i: 23, t: "return" }, // "But I remember the bell."
  { i: 24, t: "return" }, // "...celebrating the hero who murdered me."
  { i: 25, t: "beat", scale: 1.3 }, // "My eyes open in the dark."
  { i: 26, t: "beat", scale: 1.7 }, // "Fine."
  { i: 27, t: "beat", scale: 2.1 }, // "They want a monster?"
  { i: 28, t: "beat", anchor: "finale", scale: 3 }, // "I'll be the best one they ever made."
];

export const CHAPTER_ZERO: ChapterReaderConfig = {
  n: 0,
  slug: "came-back-wrong",
  kicker: "The Serial — Chapter 0",
  title: "CAME BACK WRONG",
  glitchWord: "WRONG",
  sub: TRACK.role,
  paragraphs: PROLOGUE,
  beats: CHAPTER_ZERO_BEATS,
  finale: {
    index: 28,
    kicker: "CAME BACK WRONG",
    meta: `Track ${TRACK.n} of 14 · ${BRAND.album}`,
    lines: [
      TRACK.lines[2], // "I came back wrong / Not the one you put away"
      TRACK.lines[3], // "You said goodbye to who I was — / Say hello to what's left"
      TRACK.lines[4], // "You don't get to bury what won't stay down"
    ],
  },
  hud: { lv: "LV -0060", zone: "SVC-CORRIDOR", signs: "SIGNS: WEAK" },
  pulse: true,
  hookSlug: "the-empty-hand",
};
