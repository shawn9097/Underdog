"use client";

import "./halo.css";

import gsap from "gsap";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import AscensionTiers from "./AscensionTiers";
import AuditLedger from "./AuditLedger";
import BellSection from "./BellSection";
import CrackOverlay from "./CrackOverlay";
import { DecayContext, Section, stageOf, type DecayApi } from "./decay";
import { Doctrine, Footer, Hero, WorthHeader } from "./Sections";
import { DropStamp, VoidScreen } from "./TheDrop";
import TitleGlitch from "./TitleGlitch";
import WorthAssessment from "./WorthAssessment";

type DropPhase = "live" | "falling" | "void";

export default function HaloRoot() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [worth, setWorth] = useState(100);
  const [dropped, setDropped] = useState(false);
  const [phase, setPhase] = useState<DropPhase>("live");
  const [reduced, setReduced] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [seenIds, setSeenIds] = useState<ReadonlySet<string>>(() => new Set());
  const [lastSpend, setLastSpend] = useState<{ amount: number; at: number } | null>(
    null,
  );

  const droppedRef = useRef(false);
  const reducedRef = useRef(false);
  reducedRef.current = reduced;

  /* ---------- engine ---------- */

  const spend = useCallback((amount: number) => {
    if (droppedRef.current || amount <= 0) return;
    setWorth((w) => Math.max(0, w - amount));
    setLastSpend({ amount, at: Date.now() });
  }, []);

  const judge = useCallback(() => {
    if (droppedRef.current) return;
    droppedRef.current = true;
    setWorth(0);
    setDropped(true);
  }, []);

  const markSeen = useCallback((id: string) => {
    setSeenIds((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  // Worth exhausted honestly → the Drop.
  useEffect(() => {
    if (worth <= 0 && !dropped) judge();
  }, [worth, dropped, judge]);

  useEffect(() => {
    setMounted(true);
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  /* ---------- honest decay: scroll depth ---------- */

  useEffect(() => {
    let maxDepth = 0;
    let pending = 0;
    const onScroll = () => {
      if (droppedRef.current) return;
      const doc = document.documentElement;
      const total = doc.scrollHeight - window.innerHeight;
      if (total <= 0) return;
      const depth = Math.min(1, window.scrollY / total);
      if (depth > maxDepth) {
        pending += (depth - maxDepth) * 26;
        maxDepth = depth;
      }
    };
    const flush = setInterval(() => {
      if (pending > 0.05) {
        spend(pending);
        pending = 0;
      }
    }, 450);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      clearInterval(flush);
    };
  }, [spend]);

  /* ---------- honest decay: hover-dwell on cards ---------- */

  useEffect(() => {
    const root = wrapRef.current;
    if (!root) return;
    const dwelt = new WeakSet<Element>();
    let timer: ReturnType<typeof setTimeout> | null = null;
    const over = (e: Event) => {
      const target = e.target as Element | null;
      const card = target?.closest?.("[data-dwell]");
      if (!card || dwelt.has(card)) return;
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        if (!dwelt.has(card)) {
          dwelt.add(card);
          spend(0.6);
        }
      }, 700);
    };
    const out = () => {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
    };
    root.addEventListener("pointerover", over);
    root.addEventListener("pointerout", out);
    return () => {
      root.removeEventListener("pointerover", over);
      root.removeEventListener("pointerout", out);
      if (timer) clearTimeout(timer);
    };
  }, [spend]);

  /* ---------- reveal choreography (JS-applied hidden state) ---------- */

  useEffect(() => {
    const root = wrapRef.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const els = Array.from(root.querySelectorAll<HTMLElement>("[data-reveal]"));
    els.forEach((el, i) => {
      el.classList.add("hl-prereveal");
      el.style.transitionDelay = `${(i % 4) * 90}ms`;
    });
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            (e.target as HTMLElement).classList.add("hl-revealed");
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -4% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  /* ---------- THE DROP ---------- */

  useEffect(() => {
    if (!dropped) return;
    document.body.style.overflow = "hidden";
    const root = wrapRef.current;
    if (!root) return;

    if (reducedRef.current) {
      setPhase("void");
      return;
    }

    setPhase("falling");
    const q = gsap.utils.selector(root);
    const tl = gsap.timeline({ onComplete: () => setPhase("void") });
    tl.fromTo(
      q(".hl-stamp-inner"),
      { scale: 3.1, autoAlpha: 0, rotation: 3 },
      { scale: 1, autoAlpha: 1, rotation: -8, duration: 0.38, ease: "power4.in" },
    )
      .to(q(".hl-main"), { x: 8, duration: 0.045, repeat: 7, yoyo: true, ease: "none" })
      .set(q(".hl-main"), { x: 0 })
      .to(
        q("[data-fall]"),
        {
          y: "138vh",
          rotation: () => gsap.utils.random(-10, 10),
          duration: 1.05,
          ease: "power2.in",
          stagger: 0.07,
        },
        "+=0.85",
      )
      .to(
        q(".hl-head"),
        { yPercent: -140, autoAlpha: 0, duration: 0.6, ease: "power2.in" },
        "<",
      )
      .to(
        q(".hl-stamp-inner"),
        { y: "140vh", rotation: -26, duration: 0.9, ease: "power2.in" },
        "-=0.45",
      );

    return () => {
      tl.kill();
    };
  }, [dropped]);

  // restore scroll if the visitor navigates away mid-void
  useEffect(
    () => () => {
      document.body.style.overflow = "";
    },
    [],
  );

  /* ---------- context ---------- */

  const stage = dropped ? 3 : stageOf(worth);
  const api = useMemo<DecayApi>(
    () => ({
      worth,
      stage,
      dropped,
      reduced,
      mounted,
      lastSpend,
      spend,
      judge,
      markSeen,
      seenIds,
    }),
    [worth, stage, dropped, reduced, mounted, lastSpend, spend, judge, markSeen, seenIds],
  );

  return (
    <DecayContext.Provider value={api}>
      <div
        ref={wrapRef}
        className="hl"
        data-stage={stage}
        data-dropped={dropped ? "" : undefined}
        onClickCapture={() => {
          if (!droppedRef.current) spend(0.7);
        }}
      >
        <div className="hl-sky" aria-hidden="true" />
        <div className="hl-stains" aria-hidden="true" />
        <CrackOverlay />
        <AuditLedger />
        <TitleGlitch />
        <WorthHeader />
        <main className="hl-main" aria-hidden={phase === "void" ? true : undefined}>
          <Hero />
          <Doctrine />
          <Section id="assessment">
            <WorthAssessment />
          </Section>
          <Section id="ascension">
            <AscensionTiers />
          </Section>
          <Section id="bell">
            <BellSection />
          </Section>
          <Footer />
        </main>
        {dropped && <DropStamp />}
        {dropped && <VoidScreen on={phase === "void"} />}
      </div>
    </DecayContext.Provider>
  );
}
