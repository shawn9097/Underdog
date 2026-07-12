import type { Metadata } from "next";
import CityNav from "@/components/CityNav";
import PrologueRoot from "@/components/prologue/PrologueRoot";
import { BRAND, TRACKS } from "@/lib/album";

const TRACK = TRACKS[11]; // Came Back Wrong

export const metadata: Metadata = {
  title: "Came Back Wrong",
  description: `The locked Season-1 prologue. ${TRACK.role} Track 12 of ${BRAND.album}.`,
};

export default function Page() {
  return (
    <>
      <PrologueRoot />
      <CityNav />
    </>
  );
}
