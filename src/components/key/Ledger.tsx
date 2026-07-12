"use client";

import { useState } from "react";
import { BRAND } from "@/lib/album";

interface Props {
  onClaim: (alias: string, email: string) => void;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Act III — the ledger. The form the visitor has earned.
 * Client-side only; the claim is inscribed to this device's storage.
 */
export default function Ledger({ onClaim }: Props) {
  const [alias, setAlias] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<{ alias?: string; email?: string }>({});

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: { alias?: string; email?: string } = {};
    const a = alias.trim();
    const m = email.trim();
    if (a.length < 2) next.alias = "The ledger needs a name of at least two letters.";
    if (a.length > 24) next.alias = "Twenty-four letters at most — this is an engraving.";
    if (!EMAIL_RE.test(m)) next.email = "That address won't reach anyone down here.";
    setErrors(next);
    if (next.alias || next.email) return;
    onClaim(a, m);
  };

  return (
    <section aria-labelledby="ledger-heading" className="w-full max-w-md">
      <div
        className="border px-6 py-8 backdrop-blur-sm sm:px-10 sm:py-10"
        style={{
          borderColor: "rgba(212,167,44,0.28)",
          background: "rgba(14,12,17,0.72)",
        }}
      >
        <p
          className="mb-3 text-center text-[0.62rem] tracking-[0.38em]"
          style={{ fontFamily: "var(--font-geist-mono)", color: "#8a6a1f" }}
        >
          ACT III — THE TENANCY
        </p>
        <h2
          id="ledger-heading"
          className="text-balance text-center text-2xl leading-snug sm:text-[1.7rem]"
          style={{ fontFamily: "var(--font-gloock)", color: "#ffe9a8" }}
        >
          {BRAND.emailHook}
        </h2>
        <p
          className="mt-4 text-center text-sm italic"
          style={{ fontFamily: "var(--font-crimson)", color: "#9a93a6" }}
        >
          The key is cut. The ledger asks two things, then the deed is yours.
        </p>

        <form onSubmit={submit} noValidate className="mt-8 flex flex-col gap-7">
          <div>
            <label
              htmlFor="ledger-alias"
              className="block text-[0.62rem] tracking-[0.3em]"
              style={{ fontFamily: "var(--font-geist-mono)", color: "#d4a72c" }}
            >
              ALIAS
            </label>
            <p
              className="mt-1 text-xs italic"
              style={{ fontFamily: "var(--font-crimson)", color: "#7d7689" }}
            >
              the name you answer to down here
            </p>
            <input
              id="ledger-alias"
              name="alias"
              type="text"
              autoComplete="nickname"
              maxLength={24}
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
              aria-invalid={errors.alias ? true : undefined}
              aria-describedby={errors.alias ? "ledger-alias-err" : undefined}
              className="mt-2 block h-12 w-full border-0 border-b bg-transparent px-1 text-lg outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[#d4a72c] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0e0c11]"
              style={{
                fontFamily: "var(--font-big-shoulders)",
                color: "#e8e2d6",
                borderBottom: `1px solid ${errors.alias ? "#d92b3f" : "rgba(212,167,44,0.45)"}`,
                letterSpacing: "0.06em",
              }}
            />
            {errors.alias && (
              <p
                id="ledger-alias-err"
                role="alert"
                className="mt-2 text-xs"
                style={{ fontFamily: "var(--font-geist-mono)", color: "#d92b3f" }}
              >
                {errors.alias}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="ledger-email"
              className="block text-[0.62rem] tracking-[0.3em]"
              style={{ fontFamily: "var(--font-geist-mono)", color: "#d4a72c" }}
            >
              EMAIL
            </label>
            <p
              className="mt-1 text-xs italic"
              style={{ fontFamily: "var(--font-crimson)", color: "#7d7689" }}
            >
              where word reaches you when the doors open
            </p>
            <input
              id="ledger-email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={errors.email ? true : undefined}
              aria-describedby={errors.email ? "ledger-email-err" : undefined}
              className="mt-2 block h-12 w-full border-0 border-b bg-transparent px-1 text-base outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[#d4a72c] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0e0c11]"
              style={{
                fontFamily: "var(--font-geist-mono)",
                color: "#e8e2d6",
                borderBottom: `1px solid ${errors.email ? "#d92b3f" : "rgba(212,167,44,0.45)"}`,
              }}
            />
            {errors.email && (
              <p
                id="ledger-email-err"
                role="alert"
                className="mt-2 text-xs"
                style={{ fontFamily: "var(--font-geist-mono)", color: "#d92b3f" }}
              >
                {errors.email}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="mt-2 h-13 min-h-12 w-full cursor-pointer border text-sm tracking-[0.32em] transition-colors focus-visible:ring-2 focus-visible:ring-[#f5c84c] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0e0c11]"
            style={{
              fontFamily: "var(--font-geist-mono)",
              borderColor: "#d4a72c",
              color: "#060507",
              background: "linear-gradient(180deg, #f5c84c 0%, #d4a72c 100%)",
            }}
          >
            SIGN THE LEDGER
          </button>
        </form>

        <p
          className="mt-6 text-center text-[0.68rem] leading-relaxed"
          style={{ fontFamily: "var(--font-geist-mono)", color: "#6f6879" }}
        >
          Your claim is inscribed to this device only.
          <br />
          Nothing leaves the room.
        </p>
      </div>
    </section>
  );
}
