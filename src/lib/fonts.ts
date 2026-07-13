/**
 * Local font faces (all OFL-licensed, bundled in src/fonts).
 * Each surface pulls only the families it needs via CSS variables.
 */
import localFont from "next/font/local";

/** Brutal single-weight display — THE DESCENT headlines. */
export const boldonse = localFont({
  src: "../fonts/Boldonse-Regular.ttf",
  variable: "--font-boldonse",
  display: "swap",
});

/** Condensed industrial grotesque — city signage, subheads. */
export const bigShoulders = localFont({
  src: [
    { path: "../fonts/BigShoulders-Regular.ttf", weight: "400" },
    { path: "../fonts/BigShoulders-Bold.ttf", weight: "700" },
  ],
  variable: "--font-big-shoulders",
  display: "swap",
});

/** Literary serif with italics — editorial voice, the prologue. */
export const crimsonPro = localFont({
  src: [
    { path: "../fonts/CrimsonPro-Regular.ttf", weight: "400" },
    { path: "../fonts/CrimsonPro-Bold.ttf", weight: "700" },
    { path: "../fonts/CrimsonPro-Italic.ttf", weight: "400", style: "italic" },
  ],
  variable: "--font-crimson",
  display: "swap",
});

/** Sharp display serif — ritual/ceremony headlines on /key. */
export const gloock = localFont({
  src: "../fonts/Gloock-Regular.ttf",
  variable: "--font-gloock",
  display: "swap",
});

/** Hairline elegant serif — gold-leaf accents. */
export const italiana = localFont({
  src: "../fonts/Italiana-Regular.ttf",
  variable: "--font-italiana",
  display: "swap",
});

/** Editorial serif italic accent — pull quotes. */
export const instrumentSerif = localFont({
  src: [
    { path: "../fonts/InstrumentSerif-Regular.ttf", weight: "400" },
    {
      path: "../fonts/InstrumentSerif-Italic.ttf",
      weight: "400",
      style: "italic",
    },
  ],
  variable: "--font-instrument-serif",
  display: "swap",
});

/** Clean corporate sans — THE HALO's sterile interface. */
export const instrumentSans = localFont({
  src: [
    { path: "../fonts/InstrumentSans-Regular.ttf", weight: "400" },
    { path: "../fonts/InstrumentSans-Bold.ttf", weight: "700" },
    { path: "../fonts/InstrumentSans-Italic.ttf", weight: "400", style: "italic" },
  ],
  variable: "--font-instrument-sans",
  display: "swap",
});

/** Geometric corporate sans — Halo display type. */
export const outfit = localFont({
  src: [
    { path: "../fonts/Outfit-Regular.ttf", weight: "400" },
    { path: "../fonts/Outfit-Bold.ttf", weight: "700" },
  ],
  variable: "--font-outfit",
  display: "swap",
});

/** Terminal mono — marginalia, system text. */
export const geistMono = localFont({
  src: [
    { path: "../fonts/GeistMono-Regular.ttf", weight: "400" },
    { path: "../fonts/GeistMono-Bold.ttf", weight: "700" },
  ],
  variable: "--font-geist-mono",
  display: "swap",
});

/** Broadcast console mono — THE SIGNAL. */
export const jetbrainsMono = localFont({
  src: [
    { path: "../fonts/JetBrainsMono-Regular.ttf", weight: "400" },
    { path: "../fonts/JetBrainsMono-Bold.ttf", weight: "700" },
  ],
  variable: "--font-jetbrains",
  display: "swap",
});

/** Chunky pixel — CRT headers on THE SIGNAL. */
export const silkscreen = localFont({
  src: "../fonts/Silkscreen-Regular.ttf",
  variable: "--font-silkscreen",
  display: "swap",
});

/** Techno display — signal callouts. */
export const tektur = localFont({
  src: [
    { path: "../fonts/Tektur-Regular.ttf", weight: "400" },
    { path: "../fonts/Tektur-Medium.ttf", weight: "500" },
  ],
  variable: "--font-tektur",
  display: "swap",
});

/** Pixel sans — glitch accents. */
export const pixelify = localFont({
  src: "../fonts/PixelifySans-Medium.ttf",
  variable: "--font-pixelify",
  display: "swap",
});

/** Heavy poster face — impact moments. */
export const ericaOne = localFont({
  src: "../fonts/EricaOne-Regular.ttf",
  variable: "--font-erica",
  display: "swap",
});
