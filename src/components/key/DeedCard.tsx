"use client";

import { useEffect, useState } from "react";
import { BRAND, msUntilRelease } from "@/lib/album";
import KeyGlyph from "./KeyGlyph";
import {
  type Claim,
  bowCrackSvgPath,
  formatIssued,
  keyShape,
  keySvgPath,
  mulberry32,
  fnv1a,
  seedHex,
} from "./ritual";

interface Props {
  claim: Claim;
  onReset: () => void;
}

/* ------------------------------------------------------------------ */
/* PNG export — the keepsake, drawn by hand onto a canvas              */
/* ------------------------------------------------------------------ */

function cssFont(varName: string): string {
  const fam = getComputedStyle(document.documentElement)
    .getPropertyValue(varName)
    .trim();
  return fam || "serif";
}

function wrapLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const probe = line ? `${line} ${w}` : w;
    if (ctx.measureText(probe).width > maxWidth && line) {
      lines.push(line);
      line = w;
    } else {
      line = probe;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function drawKintsugiVein(
  ctx: CanvasRenderingContext2D,
  rng: () => number,
  x: number,
  y: number,
  angle: number,
  len: number
) {
  ctx.save();
  ctx.strokeStyle = "rgba(212,167,44,0.5)";
  ctx.lineWidth = 1.4;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x, y);
  let a = angle;
  let traveled = 0;
  while (traveled < len) {
    const step = 26 + rng() * 34;
    a += (rng() - 0.5) * 0.8;
    x += Math.cos(a) * step;
    y += Math.sin(a) * step;
    traveled += step;
    ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.restore();
}

async function exportDeedPng(claim: Claim, daysLeft: number | null): Promise<void> {
  await document.fonts.ready;

  const italiana = cssFont("--font-italiana");
  const crimson = cssFont("--font-crimson");
  const mono = cssFont("--font-geist-mono");
  const shoulders = cssFont("--font-big-shoulders");

  const W = 1080;
  const H = 1660;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d");
  if (!ctx) return;

  // velvet ground
  ctx.fillStyle = "#060507";
  ctx.fillRect(0, 0, W, H);
  const glow = ctx.createRadialGradient(W / 2, 430, 60, W / 2, 430, 720);
  glow.addColorStop(0, "rgba(212,167,44,0.10)");
  glow.addColorStop(1, "rgba(212,167,44,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  // frame
  ctx.strokeStyle = "rgba(212,167,44,0.55)";
  ctx.lineWidth = 2;
  ctx.strokeRect(38, 38, W - 76, H - 76);
  ctx.strokeStyle = "rgba(212,167,44,0.25)";
  ctx.lineWidth = 1;
  ctx.strokeRect(52, 52, W - 104, H - 104);
  ctx.fillStyle = "#d4a72c";
  for (const [cx, cy] of [
    [38, 38],
    [W - 38, 38],
    [38, H - 38],
    [W - 38, H - 38],
  ] as const) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(Math.PI / 4);
    ctx.fillRect(-5, -5, 10, 10);
    ctx.restore();
  }

  // kintsugi veins from two corners — the brand signature
  const veinRng = mulberry32(fnv1a(claim.deedId));
  drawKintsugiVein(ctx, veinRng, 52, 140, 0.5, 260);
  drawKintsugiVein(ctx, veinRng, W - 52, H - 170, Math.PI + 0.4, 300);

  const center = (
    text: string,
    y: number,
    font: string,
    color: string,
    spacing = 0
  ) => {
    ctx.font = font;
    ctx.fillStyle = color;
    ctx.textAlign = "center";
    try {
      // Chromium supports letterSpacing on 2D contexts
      (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing =
        `${spacing}px`;
    } catch {
      /* older engines: skip tracking */
    }
    ctx.fillText(text, W / 2 + spacing / 2, y);
  };

  center("UNDERDOG CITY — THE SPRAWL BELOW", 132, `20px ${mono}`, "#8a6a1f", 7);
  center("DEED OF TENANCY", 226, `76px ${italiana}`, "#e8e2d6", 12);

  // hairline + diamond
  ctx.strokeStyle = "rgba(212,167,44,0.4)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(200, 268);
  ctx.lineTo(W - 200, 268);
  ctx.stroke();
  ctx.save();
  ctx.translate(W / 2, 268);
  ctx.rotate(Math.PI / 4);
  ctx.fillStyle = "#d4a72c";
  ctx.fillRect(-4, -4, 8, 8);
  ctx.restore();

  // the key
  const shape = keyShape(claim.bitting);
  const keyPath = new Path2D(keySvgPath(shape));
  const wound = new Path2D(bowCrackSvgPath(claim.seed));
  const kSize = 350;
  ctx.save();
  ctx.translate((W - kSize) / 2, 310);
  ctx.scale(kSize / 100, kSize / 100);
  const kg = ctx.createLinearGradient(50, 4, 50, 98);
  kg.addColorStop(0, "#ffe9a8");
  kg.addColorStop(0.42, "#d4a72c");
  kg.addColorStop(1, "#8a6a1f");
  ctx.shadowColor = "rgba(245,200,76,0.55)";
  ctx.shadowBlur = 22;
  ctx.fillStyle = kg;
  ctx.fill(keyPath, "evenodd");
  ctx.shadowBlur = 0;
  ctx.save();
  ctx.clip(keyPath, "evenodd");
  ctx.strokeStyle = "rgba(6,5,7,0.95)";
  ctx.lineWidth = 1.5;
  ctx.lineCap = "round";
  ctx.stroke(wound);
  ctx.restore();
  ctx.restore();

  center(claim.deedId, 758, `44px ${mono}`, "#f5c84c", 10);
  center("FRACTURE SEED " + seedHex(claim.seed), 800, `18px ${mono}`, "#6f6879", 4);

  // registry rows
  const rows: Array<[string, string]> = [
    ["TENANT", claim.alias.toUpperCase()],
    ["DEPTH", `SUBLEVEL −${claim.depth}`],
    ["ISSUED", formatIssued(claim.issuedISO)],
    ["REGISTRAR", BRAND.label.toUpperCase()],
  ];
  const colX = [W * 0.28, W * 0.72];
  const rowY = [896, 1010];
  rows.forEach(([label, value], i) => {
    const x = colX[i % 2];
    const y = rowY[Math.floor(i / 2)];
    ctx.textAlign = "center";
    ctx.font = `17px ${mono}`;
    ctx.fillStyle = "#8a6a1f";
    ctx.fillText(label, x, y);
    ctx.font = `700 40px ${shoulders}`;
    ctx.fillStyle = "#e8e2d6";
    ctx.fillText(value, x, y + 48);
  });

  ctx.strokeStyle = "rgba(212,167,44,0.3)";
  ctx.beginPath();
  ctx.moveTo(160, 1122);
  ctx.lineTo(W - 160, 1122);
  ctx.stroke();

  // the oath — the manifesto, verbatim
  center("THE OATH OF THE UNDERDOGS", 1176, `17px ${mono}`, "#8a6a1f", 6);
  try {
    (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = "0px";
  } catch {
    /* ignore */
  }
  ctx.font = `italic 36px ${crimson}`;
  ctx.fillStyle = "#e8e2d6";
  const oath = `“${BRAND.manifesto}”`;
  const lines = wrapLines(ctx, oath, 700);
  lines.forEach((l, i) => {
    ctx.fillText(l, W / 2, 1232 + i * 50);
  });

  const footY = 1232 + lines.length * 50 + 52;
  ctx.strokeStyle = "rgba(212,167,44,0.3)";
  ctx.beginPath();
  ctx.moveTo(160, footY - 34);
  ctx.lineTo(W - 160, footY - 34);
  ctx.stroke();

  center(
    `${BRAND.album.toUpperCase()} — 14 TRACKS — ${BRAND.label.toUpperCase()}`,
    footY + 8,
    `19px ${mono}`,
    "#9a93a6",
    4
  );
  center(
    daysLeft !== null && daysLeft > 0
      ? `DOORS OPEN ${BRAND.releaseDateDisplay} — ${daysLeft} DAYS`
      : `DOORS OPEN ${BRAND.releaseDateDisplay}`,
    footY + 44,
    `19px ${mono}`,
    "#d4a72c",
    4
  );
  center(BRAND.emailHook, footY + 96, `italic 30px ${crimson}`, "#8a8494", 0);

  const url = c.toDataURL("image/png");
  const a = document.createElement("a");
  a.href = url;
  a.download = `underdog-city-deed-${claim.deedId}.png`;
  a.click();
}

/* ------------------------------------------------------------------ */
/* The deed, typeset in the DOM                                        */
/* ------------------------------------------------------------------ */

export default function DeedCard({ claim, onReset }: Props) {
  const [daysLeft, setDaysLeft] = useState<number | null>(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    setDaysLeft(Math.ceil(msUntilRelease(Date.now()) / 86_400_000));
  }, []);

  const keep = async () => {
    setExporting(true);
    try {
      await exportDeedPng(claim, daysLeft);
    } finally {
      setExporting(false);
    }
  };

  const hairline = (
    <div aria-hidden className="relative my-6 h-px w-full" style={{ background: "rgba(212,167,44,0.3)" }}>
      <span
        className="absolute left-1/2 top-1/2 block h-2 w-2 -translate-x-1/2 -translate-y-1/2 rotate-45"
        style={{ background: "#d4a72c" }}
      />
    </div>
  );

  return (
    <section aria-labelledby="deed-heading" className="flex w-full max-w-xl flex-col items-center">
      <article
        className="relative w-full border px-6 py-10 sm:px-12"
        style={{
          borderColor: "rgba(212,167,44,0.5)",
          background:
            "radial-gradient(ellipse 90% 40% at 50% 18%, rgba(212,167,44,0.08), transparent), #0a080d",
          boxShadow:
            "0 0 0 1px rgba(212,167,44,0.12), 0 0 80px rgba(212,167,44,0.07), inset 0 0 0 8px #0a080d, inset 0 0 0 9px rgba(212,167,44,0.22)",
        }}
      >
        {/* corner marks */}
        {(["-top-1 -left-1", "-top-1 -right-1", "-bottom-1 -left-1", "-bottom-1 -right-1"] as const).map(
          (pos) => (
            <span
              key={pos}
              aria-hidden
              className={`absolute ${pos} block h-2.5 w-2.5 rotate-45`}
              style={{ background: "#d4a72c" }}
            />
          )
        )}

        <p
          className="text-center text-[0.6rem] tracking-[0.42em]"
          style={{ fontFamily: "var(--font-geist-mono)", color: "#8a6a1f" }}
        >
          UNDERDOG CITY — THE SPRAWL BELOW
        </p>
        <h2
          id="deed-heading"
          className="mt-4 text-center text-[1.55rem] tracking-[0.12em] sm:text-4xl sm:tracking-[0.14em]"
          style={{ fontFamily: "var(--font-italiana)", color: "#e8e2d6" }}
        >
          DEED OF TENANCY
        </h2>

        {hairline}

        <KeyGlyph
          bitting={claim.bitting}
          seed={claim.seed}
          title={`Key ${claim.deedId}, cut from fracture seed ${seedHex(claim.seed)}`}
          className="mx-auto h-44 w-44 sm:h-52 sm:w-52"
        />

        <p
          className="mt-4 text-center text-xl tracking-[0.22em] sm:text-2xl"
          style={{ fontFamily: "var(--font-geist-mono)", color: "#f5c84c" }}
        >
          {claim.deedId}
        </p>
        <p
          className="mt-1 text-center text-[0.62rem] tracking-[0.24em]"
          style={{ fontFamily: "var(--font-geist-mono)", color: "#6f6879" }}
        >
          FRACTURE SEED {seedHex(claim.seed)}
        </p>

        <dl className="mt-8 grid grid-cols-2 gap-x-4 gap-y-6 text-center">
          {(
            [
              ["TENANT", claim.alias.toUpperCase()],
              ["DEPTH", `SUBLEVEL −${claim.depth}`],
              ["ISSUED", formatIssued(claim.issuedISO)],
              ["REGISTRAR", BRAND.label.toUpperCase()],
            ] as const
          ).map(([label, value]) => (
            <div key={label}>
              <dt
                className="text-[0.6rem] tracking-[0.3em]"
                style={{ fontFamily: "var(--font-geist-mono)", color: "#8a6a1f" }}
              >
                {label}
              </dt>
              <dd
                className="mt-1.5 break-words text-xl font-bold tracking-wide sm:text-2xl"
                style={{ fontFamily: "var(--font-big-shoulders)", color: "#e8e2d6" }}
              >
                {value}
              </dd>
            </div>
          ))}
        </dl>

        {hairline}

        <p
          className="text-center text-[0.6rem] tracking-[0.32em]"
          style={{ fontFamily: "var(--font-geist-mono)", color: "#8a6a1f" }}
        >
          THE OATH OF THE UNDERDOGS
        </p>
        <blockquote
          className="mx-auto mt-4 max-w-sm text-center text-lg italic leading-relaxed sm:text-xl"
          style={{ fontFamily: "var(--font-crimson)", color: "#e8e2d6" }}
        >
          “{BRAND.manifesto}”
        </blockquote>

        {hairline}

        <p
          className="text-center text-[0.66rem] leading-loose tracking-[0.18em]"
          style={{ fontFamily: "var(--font-geist-mono)", color: "#9a93a6" }}
        >
          {BRAND.album.toUpperCase()} — 14 TRACKS — {BRAND.label.toUpperCase()}
          <br />
          <span style={{ color: "#d4a72c" }}>
            DOORS OPEN {BRAND.releaseDateDisplay}
            {daysLeft !== null && daysLeft > 0 ? ` — ${daysLeft} DAYS` : ""}
          </span>
        </p>
      </article>

      <div className="mt-8 flex w-full flex-col items-stretch justify-center gap-4 sm:flex-row">
        <button
          type="button"
          onClick={keep}
          disabled={exporting}
          className="min-h-12 cursor-pointer border px-8 text-sm tracking-[0.28em] transition-opacity focus-visible:ring-2 focus-visible:ring-[#f5c84c] focus-visible:ring-offset-2 focus-visible:ring-offset-[#060507] disabled:opacity-60"
          style={{
            fontFamily: "var(--font-geist-mono)",
            borderColor: "#d4a72c",
            color: "#060507",
            background: "linear-gradient(180deg, #f5c84c 0%, #d4a72c 100%)",
          }}
        >
          {exporting ? "ENGRAVING…" : "KEEP YOUR DEED"}
        </button>
        <button
          type="button"
          onClick={onReset}
          className="min-h-12 cursor-pointer border px-8 text-sm tracking-[0.28em] transition-colors hover:text-[#f5c84c] focus-visible:ring-2 focus-visible:ring-[#d4a72c] focus-visible:ring-offset-2 focus-visible:ring-offset-[#060507]"
          style={{
            fontFamily: "var(--font-geist-mono)",
            borderColor: "rgba(212,167,44,0.4)",
            color: "#9a93a6",
            background: "transparent",
          }}
        >
          BREAK ANOTHER
        </button>
      </div>
      <p
        className="mt-4 text-center text-[0.64rem]"
        style={{ fontFamily: "var(--font-geist-mono)", color: "#6f6879" }}
      >
        Breaking another slab forfeits this deed on this device.
      </p>
    </section>
  );
}
