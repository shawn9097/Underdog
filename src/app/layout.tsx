import type { Metadata, Viewport } from "next";
import {
  boldonse,
  bigShoulders,
  crimsonPro,
  gloock,
  italiana,
  instrumentSerif,
  instrumentSans,
  outfit,
  geistMono,
  jetbrainsMono,
  silkscreen,
  tektur,
  pixelify,
  ericaOne,
} from "@/lib/fonts";
import { BRAND } from "@/lib/album";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: `${BRAND.artist} — ${BRAND.album}`,
    template: `%s — ${BRAND.artist}`,
  },
  description: BRAND.thesis,
  openGraph: {
    title: `${BRAND.artist} — ${BRAND.album}`,
    description: `${BRAND.taglines[0]} Out ${BRAND.releaseDateDisplay} on ${BRAND.label}.`,
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#060507",
  width: "device-width",
  initialScale: 1,
};

const fontVars = [
  boldonse,
  bigShoulders,
  crimsonPro,
  gloock,
  italiana,
  instrumentSerif,
  instrumentSans,
  outfit,
  geistMono,
  jetbrainsMono,
  silkscreen,
  tektur,
  pixelify,
  ericaOne,
]
  .map((f) => f.variable)
  .join(" ");

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={fontVars}>
      <body>{children}</body>
    </html>
  );
}
