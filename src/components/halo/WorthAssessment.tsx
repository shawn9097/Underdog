"use client";

import { useEffect, useRef, useState } from "react";
import { Corruptible, TruthSwap } from "./Corruptible";
import { useDecay } from "./decay";

/**
 * WORTH ASSESSMENT — five cold, clinical questions. Every possible
 * outcome scores the visitor as insufficient, because the Sainted
 * decide who has worth, and they already have.
 */

interface Answer {
  label: string;
  finding: string;
}
interface Question {
  q: string;
  a: [Answer, Answer];
}

const QUESTIONS: Question[] = [
  {
    q: "Have you ever been broken?",
    a: [
      {
        label: "Yes",
        finding: "DAMAGE ON RECORD. BROKEN THINGS HOLD NO WORTH ABOVE.",
      },
      {
        label: "No",
        finding: "UNBROKEN IS UNPROVEN. UNTESTED WORTH IS NOT WORTH.",
      },
    ],
  },
  {
    q: "Do you believe you have worth?",
    a: [
      {
        label: "I do",
        finding: "WORTH IS NOT SELF-ASSESSED. THE SAINTED DECIDE WHO HAS WORTH.",
      },
      {
        label: "I don't know",
        finding: "UNCERTAINTY NOTED. THE SAINTED ARE NEVER UNCERTAIN.",
      },
    ],
  },
  {
    q: "When you fall, do you expect a hand?",
    a: [
      {
        label: "Yes",
        finding: "DEPENDENCY RECORDED. THE HALO DOES NOT REACH DOWN.",
      },
      {
        label: "Not anymore",
        finding: "RESENTMENT RECORDED. GRATITUDE IS A METRIC.",
      },
    ],
  },
  {
    q: "Is your pain productive?",
    a: [
      {
        label: "I make it useful",
        finding: "PERFORMANCE IS NOT CONTRIBUTION. DEDUCTION APPLIED.",
      },
      {
        label: "No",
        finding: "UNPRODUCTIVE PAIN IS WASTE. THE HALO STORES NO WASTE.",
      },
    ],
  },
  {
    q: "Would you accept serenity, if it cost you everything you are?",
    a: [
      {
        label: "Yes",
        finding: "FLAGGED FOR ASCENSION REVIEW. CANDIDATES ARE ASKED ONLY ONCE.",
      },
      {
        label: "No",
        finding: "REFUSAL OF SALVATION RECORDED. ASSESSMENT CONCLUDED.",
      },
    ],
  },
];

type Phase = "intro" | "asking" | "finding" | "verdict";

export default function WorthAssessment() {
  const { spend, judge } = useDecay();
  const [phase, setPhase] = useState<Phase>("intro");
  const [idx, setIdx] = useState(0);
  const [log, setLog] = useState<string[]>([]);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const answer = (finding: string) => {
    if (phase !== "asking") return;
    spend(6);
    setLog((l) => [...l, finding]);
    setPhase("finding");
    timer.current = setTimeout(() => {
      if (idx + 1 >= QUESTIONS.length) {
        spend(8);
        setPhase("verdict");
      } else {
        setIdx((i) => i + 1);
        setPhase("asking");
      }
    }, 1700);
  };

  const answered = phase === "verdict" ? QUESTIONS.length : log.length;

  return (
    <div className="hl-wrap">
      <div className="hl-sechead" data-reveal>
        <p className="hl-micro">MANDATORY FOR ALL VISITORS</p>
        <h2 className="hl-h2">
          <Corruptible text="Worth Assessment" />
        </h2>
      </div>

      <div className="hl-card hl-assess-card" data-reveal data-dwell>
        {phase === "intro" && (
          <div>
            <p className="hl-assess-q">
              Five questions. The Sainted will decide — they always do.
            </p>
            <p className="hl-body" style={{ marginBottom: "1.8rem" }}>
              <TruthSwap
                lie="Answer honestly. Worth is not a feeling; it is a finding, and it will be issued to you."
                truth="Run by the Sainted, who decide who has worth."
              />
            </p>
            <button
              type="button"
              className="hl-btn"
              onClick={() => {
                spend(2);
                setPhase("asking");
              }}
            >
              Begin Assessment
            </button>
          </div>
        )}

        {(phase === "asking" || phase === "finding") && (
          <div>
            <div className="hl-assess-progress">
              <span className="hl-micro">
                QUESTION 0{idx + 1} / 0{QUESTIONS.length}
              </span>
              <span className="hl-assess-bar" aria-hidden="true">
                <span style={{ width: `${(answered / QUESTIONS.length) * 100}%` }} />
              </span>
            </div>
            <p className="hl-assess-q">{QUESTIONS[idx].q}</p>
            <div className="hl-assess-answers">
              {QUESTIONS[idx].a.map((a) => (
                <button
                  key={a.label}
                  type="button"
                  className="hl-btn hl-btn--ghost"
                  disabled={phase === "finding"}
                  onClick={() => answer(a.finding)}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {phase === "verdict" && (
          <div className="hl-verdict">
            <p className="hl-micro">ASSESSMENT COMPLETE</p>
            <p className="hl-verdict-word">
              <Corruptible text="Finding: Insufficient" />
            </p>
            <p className="hl-verdict-note">
              <TruthSwap
                lie="This finding is consistent with every finding this office has ever issued. Your placement below has been scheduled with care."
                truth="When the Halo deems you worthless, you're cast down."
              />
            </p>
            <button
              type="button"
              className="hl-btn hl-btn--final"
              onClick={() => judge()}
            >
              Request Final Determination
            </button>
          </div>
        )}

        {log.length > 0 && phase !== "verdict" && (
          <ul className="hl-findings" aria-live="polite">
            {log.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
