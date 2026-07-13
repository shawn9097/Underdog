import type { Metadata } from "next";
import SignalConsole from "@/components/signal/SignalConsole";
import { BRAND } from "@/lib/album";

export const metadata: Metadata = {
  title: "THE SIGNAL",
  description: `Pirate broadcast console on a hijacked Halo frequency — 14 channels, one ghost carrier. ${BRAND.album} by ${BRAND.artist}, out ${BRAND.releaseDateDisplay} on ${BRAND.label}.`,
};

export default function Page() {
  return (
    <>
      <SignalConsole />
    </>
  );
}
