import type { Metadata } from "next";
import MusicShell from "@/components/music/Shell";
import { BRAND } from "@/lib/album";

export const metadata: Metadata = {
  title: "THE MUSIC",
  description: `${BRAND.album} — 14 tracks in the city's music room. Sealed until ${BRAND.releaseDateDisplay}; tenants with a claimed key get in early. ${BRAND.label}.`,
};

export default function MusicLayout({ children }: { children: React.ReactNode }) {
  return <MusicShell>{children}</MusicShell>;
}
