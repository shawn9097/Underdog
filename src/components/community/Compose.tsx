"use client";

import { useState } from "react";
import { leaveMark, type WallPost } from "@/lib/backend";
import { type Claim, formatTenantNo } from "./ritual";
import { describeMarkError, type MarkErrorKind } from "./errors";

interface Props {
  claim: Claim;
  onPosted: (post: WallPost) => void;
}

const LIMIT = 280;

/**
 * Leave a mark on the wall. Tenants only. The server's guardrails are real —
 * 280 characters, no links, no slurs, three marks an hour — and each one is
 * surfaced here in the city's own voice.
 */
export default function Compose({ claim, onPosted }: Props) {
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<{ message: string; kind: MarkErrorKind } | null>(null);

  const trimmed = body.trim();
  const remaining = LIMIT - body.length;
  const over = remaining < 0;
  const canSend = trimmed.length > 0 && !over && !busy;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSend) return;
    setBusy(true);
    setError(null);
    try {
      const { id, created_at } = await leaveMark(claim.deedId, claim.tenantKey, trimmed);
      onPosted({
        id,
        alias: claim.alias,
        tenant_number: claim.tenantNumber,
        body: trimmed,
        created_at,
      });
      setBody("");
    } catch (err) {
      setError(describeMarkError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      aria-busy={busy}
      className="relative w-full border p-5 sm:p-6"
      style={{
        borderColor: "rgba(212,167,44,0.32)",
        background:
          "linear-gradient(180deg, rgba(20,17,26,0.85), rgba(10,8,13,0.92))",
      }}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <label
          htmlFor="mark-body"
          className="text-[0.6rem] tracking-[0.3em]"
          style={{ fontFamily: "var(--font-geist-mono)", color: "#d4a72c" }}
        >
          LEAVE YOUR MARK
        </label>
        <span
          className="text-[0.58rem] tracking-[0.24em]"
          style={{ fontFamily: "var(--font-geist-mono)", color: "#6f6879" }}
        >
          No. {formatTenantNo(claim.tenantNumber)} · {claim.alias.toUpperCase()}
        </span>
      </div>

      <textarea
        id="mark-body"
        value={body}
        onChange={(e) => {
          setBody(e.target.value);
          if (error) setError(null);
        }}
        rows={3}
        maxLength={LIMIT + 40}
        disabled={busy}
        placeholder="say your piece. it stays on the wall."
        aria-describedby="mark-count mark-rules"
        aria-invalid={error ? true : undefined}
        className="block w-full resize-none bg-transparent text-base leading-relaxed outline-none transition-colors placeholder:italic focus-visible:ring-1 focus-visible:ring-[#d4a72c] disabled:opacity-60"
        style={{
          fontFamily: "var(--font-crimson)",
          color: "#e8e2d6",
        }}
      />

      <div className="mt-3 flex items-center justify-between gap-3">
        <p
          id="mark-rules"
          className="text-[0.56rem] leading-relaxed tracking-[0.14em]"
          style={{ fontFamily: "var(--font-geist-mono)", color: "#57505f" }}
        >
          NO LINKS · THREE MARKS AN HOUR
        </p>
        <div className="flex items-center gap-4">
          <span
            id="mark-count"
            aria-live="polite"
            className="text-[0.62rem] tabular-nums"
            style={{
              fontFamily: "var(--font-geist-mono)",
              color: over ? "#d92b3f" : remaining <= 40 ? "#d4a72c" : "#6f6879",
            }}
          >
            {remaining}
          </span>
          <button
            type="submit"
            disabled={!canSend}
            className="min-h-11 cursor-pointer border px-6 text-[0.66rem] tracking-[0.28em] transition-opacity focus-visible:ring-2 focus-visible:ring-[#f5c84c] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a080d] disabled:cursor-not-allowed disabled:opacity-45"
            style={{
              fontFamily: "var(--font-geist-mono)",
              borderColor: "#d4a72c",
              color: "#060507",
              background: "linear-gradient(180deg, #f5c84c 0%, #d4a72c 100%)",
            }}
          >
            {busy ? "DRYING…" : "MARK IT"}
          </button>
        </div>
      </div>

      {error && (
        <p
          role="alert"
          className="mt-3 border-l-2 pl-3 text-sm italic"
          style={{
            fontFamily: "var(--font-crimson)",
            borderColor: error.kind === "network" ? "#d4a72c" : "#d92b3f",
            color: error.kind === "network" ? "#ffe9a8" : "#e8a9b0",
          }}
        >
          {error.message}
        </p>
      )}
    </form>
  );
}
