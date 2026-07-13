/**
 * Kintsugi wax seal — the mark on a chapter that is still sealed shut.
 * A matte-dark wax disc, hairline cracks running through it, and the broken
 * crown at its heart (canon motifs: kintsugi + the broken crown). Purely
 * decorative; parents carry the status text.
 */

export default function WaxSeal({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 72 72"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {/* wax blob — deliberately uneven, pressed by hand */}
      <path
        className="ws-wax"
        d="M36 7c10-2 21 4 25 14 4 9 3 21-4 29-7 9-20 15-31 10C15 55 8 45 9 33 10 20 24 9 36 7Z"
      />
      {/* pressed inner ring */}
      <circle className="ws-ring" cx="36" cy="36" r="21" />
      {/* kintsugi hairlines */}
      <path className="ws-crack" d="M36 36 34 27l3-6-2-8" />
      <path className="ws-crack" d="M36 36l9 4 9 3" />
      <path className="ws-crack" d="M36 36l-8 7-5 9" />
      <path className="ws-crack ws-crack-faint" d="M36 36l-10-3-7 1" />
      <path className="ws-crack ws-crack-faint" d="M36 36l4 10-1 8" />
      {/* the broken crown — split at its centre */}
      <path className="ws-crown" d="M27 42l2-9 5 5 1.4-4.6" />
      <path className="ws-crown" d="M37.8 33.2 39 29l4 5 3-8 2 16" />
      <path className="ws-crown" d="M27 42h7" />
      <path className="ws-crown" d="M38 42h9.6" />
    </svg>
  );
}
