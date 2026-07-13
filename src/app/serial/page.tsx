import type { Metadata } from "next";
import SerialIndex from "@/components/serial/SerialIndex";
import { BRAND } from "@/lib/album";

export const metadata: Metadata = {
  title: "The Serial",
  description: `The story of Underdog City, told chapter by chapter — each one scored by a track from ${BRAND.album}. Chapter 0, "Came Back Wrong," is live now.`,
};

export default function Page() {
  return <SerialIndex />;
}
