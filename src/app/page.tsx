import type { Metadata } from "next";
import { BRAND } from "@/lib/album";
import DescentPage from "@/components/descent/DescentPage";

export const metadata: Metadata = {
  title: "The Descent",
  description: `${BRAND.album} — the debut album from ${BRAND.artist}. Out ${BRAND.releaseDateDisplay} on ${BRAND.label}. ${BRAND.taglines[0]}`,
};

export default function Page() {
  return <DescentPage />;
}
