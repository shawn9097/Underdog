import type { Metadata } from "next";
import ChapterReader from "@/components/serial/ChapterReader";
import { CHAPTER_ZERO } from "@/components/serial/chapterZero";
import { BRAND, TRACKS } from "@/lib/album";

const TRACK = TRACKS[11]; // Came Back Wrong

export const metadata: Metadata = {
  title: "Chapter 0 — Came Back Wrong",
  description: `The Serial, Chapter 0. ${TRACK.role} Scored by Track 12 of ${BRAND.album}.`,
};

export default function Page() {
  return <ChapterReader config={CHAPTER_ZERO} />;
}
