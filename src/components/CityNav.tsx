"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const SURFACES = [
  { href: "/", label: "THE CITY", glyph: "▼" },
  { href: "/serial", label: "THE SERIAL", glyph: "✝" },
  { href: "/music", label: "THE MUSIC", glyph: "◍" },
  { href: "/community", label: "THE COMMUNITY", glyph: "⚿" },
  { href: "/halo", label: "THE HALO · LORE", glyph: "◯" },
];

/**
 * District map — the shared portal between the five surfaces.
 * Deliberately neutral chrome (mono + gold) so it survives every art
 * direction. Collapsed to a sigil; expands on hover/focus/tap.
 */
export default function CityNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <nav
      ref={rootRef}
      aria-label="Underdog City districts"
      style={{
        position: "fixed",
        left: "1rem",
        bottom: "1rem",
        zIndex: 9999,
        fontFamily: "var(--font-geist-mono)",
        fontSize: "0.68rem",
        letterSpacing: "0.08em",
      }}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-controls="citynav-list"
        onClick={() => setOpen((v) => !v)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          background: "rgba(6,5,7,0.82)",
          border: "1px solid rgba(212,167,44,0.4)",
          color: "#d4a72c",
          padding: "0.45rem 0.7rem",
          cursor: "pointer",
          backdropFilter: "blur(6px)",
          transition: "border-color 200ms ease, color 200ms ease",
        }}
      >
        <span
          aria-hidden
          style={{
            display: "inline-block",
            width: "0.55rem",
            height: "0.55rem",
            background:
              "conic-gradient(from 45deg, #d4a72c 0 25%, transparent 25% 50%, #d4a72c 50% 75%, transparent 75%)",
            transform: open ? "rotate(45deg)" : "none",
            transition: "transform 300ms cubic-bezier(0.6,0,0.2,1)",
          }}
        />
        DISTRICT MAP
      </button>
      <ul
        id="citynav-list"
        style={{
          listStyle: "none",
          margin: 0,
          padding: open ? "0.5rem 0" : 0,
          maxHeight: open ? "14rem" : 0,
          overflow: "hidden",
          background: "rgba(6,5,7,0.92)",
          border: open ? "1px solid rgba(212,167,44,0.25)" : "1px solid transparent",
          borderTop: "none",
          transition:
            "max-height 320ms cubic-bezier(0.6,0,0.2,1), padding 320ms, border-color 320ms",
          backdropFilter: "blur(6px)",
        }}
      >
        {SURFACES.map((s) => {
          const active =
            s.href === "/" ? pathname === "/" : pathname.startsWith(s.href);
          return (
            <li key={s.href}>
              <Link
                href={s.href}
                aria-current={active ? "page" : undefined}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.55rem",
                  padding: "0.35rem 0.75rem",
                  color: active ? "#ffe9a8" : "#8a8494",
                  textDecoration: "none",
                  transition: "color 160ms ease, padding-left 160ms ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#f5c84c";
                  e.currentTarget.style.paddingLeft = "1rem";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = active ? "#ffe9a8" : "#8a8494";
                  e.currentTarget.style.paddingLeft = "0.75rem";
                }}
              >
                <span aria-hidden style={{ color: active ? "#d4a72c" : "#4a4552" }}>
                  {s.glyph}
                </span>
                {s.label}
                {active && (
                  <span aria-hidden style={{ marginLeft: "auto", color: "#d4a72c" }}>
                    ◆
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
