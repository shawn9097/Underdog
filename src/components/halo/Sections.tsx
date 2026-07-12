"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BRAND } from "@/lib/album";
import { Corruptible, TruthSwap } from "./Corruptible";
import { Section, useDecay } from "./decay";
import HaloSigil from "./HaloSigil";

/* ---------------- header: the Worth Index ---------------- */

export function WorthHeader() {
  const { worth, dropped, lastSpend } = useDecay();
  const status = dropped
    ? "WORTHLESS"
    : worth > 75
      ? "PROVISIONAL"
      : worth > 50
        ? "UNDER REVIEW"
        : worth > 25
          ? "DEFICIENT"
          : "INSUFFICIENT";

  return (
    <header className="hl-head">
      <p className="hl-word">
        <span className="hl-word-ring" aria-hidden="true" />
        THE HALO
      </p>
      <p
        className="hl-worth"
        aria-label={`Worth index ${dropped ? "0.00" : worth.toFixed(2)} — ${status}`}
      >
        <span className="hl-worth-label" aria-hidden="true">
          WORTH INDEX
        </span>
        <span className="hl-worth-num" aria-hidden="true">
          {dropped ? "0.00" : worth.toFixed(2)}
        </span>
        <span className="hl-worth-status" aria-hidden="true">
          {status}
        </span>
        {lastSpend && !dropped && (
          <span key={lastSpend.at} className="hl-deduct" aria-hidden="true">
            −{lastSpend.amount.toFixed(2)}
          </span>
        )}
      </p>
    </header>
  );
}

/* ---------------- hero ---------------- */

function StatsStrip() {
  const [assessed, setAssessed] = useState(4_112_930);
  useEffect(() => {
    const iv = setInterval(() => {
      if (!document.hidden) {
        setAssessed((a) => a + 1 + Math.floor(Math.random() * 3));
      }
    }, 5000);
    return () => clearInterval(iv);
  }, []);

  return (
    <div className="hl-wrap hl-stats" data-reveal>
      <div className="hl-stat">
        <span className="hl-stat-num">{assessed.toLocaleString("en-US")}</span>
        <span className="hl-micro">CITIZENS ASSESSED</span>
      </div>
      <div className="hl-stat">
        <span className="hl-stat-num">216,004</span>
        <span className="hl-micro">ASCENSIONS GRANTED</span>
      </div>
      <div className="hl-stat">
        <span className="hl-stat-num">
          <TruthSwap lie="—" truth="0" />
        </span>
        <span className="hl-micro">FOUND SUFFICIENT</span>
      </div>
    </div>
  );
}

export function Hero() {
  return (
    <Section id="hero" className="hl-hero">
      <div className="hl-wrap hl-hero-grid">
        <div className="hl-hero-copy">
          <p className="hl-micro" data-reveal>
            THE GLEAMING RING ABOVE
          </p>
          <span className="hl-goldline" aria-hidden="true" data-reveal />
          <h1 className="hl-h1" data-reveal>
            <Corruptible text="Redemption," />
            <br />
            <Corruptible text="perfected." />
          </h1>
          <p className="hl-lede" data-reveal>
            <TruthSwap
              lie="The Halo is the light above the noise. The Sainted decide who has worth — so you never have to wonder about yours."
              truth="Cold, self-righteous, redemption-as-product."
            />
          </p>
          <div className="hl-cta-row" data-reveal>
            <a className="hl-btn" href="#assessment">
              Begin Worth Assessment
            </a>
            <a className="hl-btn hl-btn--ghost" href="#ascension">
              Ascension Tiers
            </a>
          </div>
        </div>
        <HaloSigil />
      </div>
      <StatsStrip />
    </Section>
  );
}

/* ---------------- doctrine ---------------- */

const PILLARS = [
  {
    n: "01",
    t: "WORTH",
    lie: "Worth is not a feeling. It is a finding. The Sainted measure it precisely, so you never have to carry the question alone.",
    truth: "When the Halo deems you worthless, you're cast down.",
  },
  {
    n: "02",
    t: "LIGHT",
    lie: "A mile of steel and money between you and the noise below. Clean. Bright. Always.",
    truth:
      "A man with very clean boots is being handed a medal for what he just did to me.",
  },
  {
    n: "03",
    t: "MERCY",
    lie: "Not every problem can live in the light. Placement below is painless, permanent, and polite.",
    truth: "The monster crawled up out of the dark. The hero put it down. Sleep well.",
  },
];

export function Doctrine() {
  return (
    <Section id="doctrine">
      <div className="hl-wrap">
        <div className="hl-sechead" data-reveal>
          <p className="hl-micro">DOCTRINE</p>
          <h2 className="hl-h2">
            <TruthSwap
              lie="Three promises, kept above."
              truth="No saints, no savior, no grave."
              minStage={3}
            />
          </h2>
        </div>
        <div className="hl-pillars">
          {PILLARS.map((p) => (
            <div key={p.n} className="hl-card" data-dwell data-reveal>
              <p className="hl-pillar-n">{p.n}</p>
              <h3 className="hl-pillar-t">
                <Corruptible text={p.t} />
              </h3>
              <p className="hl-pillar-b">
                <TruthSwap lie={p.lie} truth={p.truth} />
              </p>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

/* ---------------- footer ---------------- */

export function Footer() {
  const { judge, stage } = useDecay();
  return (
    <Section id="determination" className="hl-footer">
      <div className="hl-wrap">
        <span className="hl-rule" aria-hidden="true" />
        <p className="hl-foot-doctrine" data-reveal>
          <TruthSwap
            lie="The Halo — run by the Sainted, who decide who has worth."
            truth="I remember the clean, bright sound of a whole city celebrating the hero who murdered me."
          />
        </p>
        <button
          type="button"
          className="hl-btn hl-btn--final"
          onClick={() => judge()}
          data-reveal
        >
          Submit for Final Determination
        </button>
        <p className="hl-micro hl-foot-note" data-reveal>
          EVERY DETERMINATION IS FINAL. NO APPEAL HAS EVER BEEN GRANTED.
        </p>
        {stage >= 2 && (
          <p className="hl-foot-truthlink">
            <Link href="/prologue">what the bell was really for — came back wrong ✝</Link>
          </p>
        )}
        <p className="hl-colophon">
          UNDERDOG CITY — “{BRAND.album.toUpperCase()}” — {BRAND.releaseDateDisplay} —{" "}
          {BRAND.label.toUpperCase()}
        </p>
      </div>
    </Section>
  );
}
