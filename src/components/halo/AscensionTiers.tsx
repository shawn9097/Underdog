"use client";

import { useState } from "react";
import { Corruptible, TruthSwap } from "./Corruptible";
import { useDecay } from "./decay";

/**
 * ASCENSION — the product. Hollowness sold as serenity, in three tiers.
 * Canon: burn out and you go hollow and ascend — becoming a husk the
 * Halo reclaims as one of the Sainted. Salvation is the real horror.
 */

interface Tier {
  idx: string;
  name: string;
  price: string;
  desc: { lie: string; truth: string };
  feats: string[];
  featured?: boolean;
}

const TIERS: Tier[] = [
  {
    idx: "TIER I",
    name: "GRACE",
    price: "FREE",
    desc: {
      lie: "Entry-level absolution. Grace is free.",
      truth: "Told me grace is free but redemption ain't cheap.",
    },
    feats: [
      "Annual Worth Assessment",
      "Victory bell notifications",
      "A place in the queue",
    ],
  },
  {
    idx: "TIER II",
    name: "REDEMPTION",
    price: "PRICED UPON REVIEW",
    desc: {
      lie: "Structured absolution for the almost-worthy. Redemption is our product.",
      truth: "Cold, self-righteous, redemption-as-product.",
    },
    feats: [
      "Everything in Grace",
      "Scheduled forgiveness",
      "Boot-cleaning service",
      "Priority review by the Sainted",
    ],
  },
  {
    idx: "TIER III",
    name: "SAINTHOOD",
    price: "EVERYTHING",
    featured: true,
    desc: {
      lie: "Ascend. Become one of the Sainted. Total serenity, permanently administered.",
      truth: "Go hollow and ascend — becoming a husk the Halo reclaims as one of the Sainted.",
    },
    feats: [
      "You will want for nothing",
      "You will want nothing",
      "Freedom from memory",
      "You will never fall",
    ],
  },
];

const VOICES: { q: string; truth?: string }[] = [
  { q: "I want for nothing. I want nothing." },
  { q: "The noise is gone. I believe it was mine." },
  { q: "I am at peace. I am told I am at peace.", truth: "Salvation is the real horror." },
];

export default function AscensionTiers() {
  const { spend } = useDecay();
  const [recorded, setRecorded] = useState<Record<string, boolean>>({});

  const select = (name: string) => {
    spend(4);
    setRecorded((r) => ({ ...r, [name]: true }));
  };

  return (
    <div className="hl-wrap">
      <div className="hl-sechead" data-reveal>
        <p className="hl-micro">THE PRODUCT</p>
        <h2 className="hl-h2">
          <Corruptible text="Ascension" />
        </h2>
        <p className="hl-lede" style={{ marginTop: "1rem" }}>
          <TruthSwap
            lie="Serenity, guaranteed. The highest form of worth is to stop needing any."
            truth="Salvation is the real horror."
          />
        </p>
      </div>

      <div className="hl-tiers">
        {TIERS.map((t) => (
          <div
            key={t.name}
            className={t.featured ? "hl-card hl-tier hl-tier--featured" : "hl-card hl-tier"}
            data-dwell
            data-reveal
          >
            {t.featured && <span className="hl-tier-flag">MOST SERENE</span>}
            <p className="hl-micro">{t.idx}</p>
            <h3 className="hl-tier-name">
              <Corruptible text={t.name} />
            </h3>
            <p className="hl-tier-price">{t.price}</p>
            <p className="hl-tier-desc">
              <TruthSwap lie={t.desc.lie} truth={t.desc.truth} />
            </p>
            <ul className="hl-tier-feats">
              {t.feats.map((f) => (
                <li key={f}>
                  <Corruptible text={f} />
                </li>
              ))}
            </ul>
            <button
              type="button"
              className="hl-btn hl-btn--ghost"
              onClick={() => select(t.name)}
            >
              Select {t.name}
            </button>
            <p className="hl-tier-recorded" role="status">
              {recorded[t.name] ? "YOUR INTEREST HAS BEEN RECORDED AGAINST YOUR FILE." : " "}
            </p>
          </div>
        ))}
      </div>

      <div className="hl-voices">
        {VOICES.map((v) => (
          <blockquote key={v.q} className="hl-voice" data-reveal data-dwell>
            <p className="hl-voice-q">
              {v.truth ? (
                <TruthSwap lie={`“${v.q}”`} truth={`“${v.truth}”`} />
              ) : (
                <Corruptible text={`“${v.q}”`} />
              )}
            </p>
            <p className="hl-voice-a">— ONE OF THE SAINTED</p>
          </blockquote>
        ))}
      </div>
    </div>
  );
}
