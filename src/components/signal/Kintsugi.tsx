/**
 * Kintsugi gold-crack motifs for THE SIGNAL — the brand signature rendered
 * as fractures in the console glass, repaired with gold.
 */

export function KintsugiCrack({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 320 640"
      aria-hidden="true"
      focusable="false"
      preserveAspectRatio="xMaxYMin meet"
    >
      <defs>
        <linearGradient id="sig-kincrack-g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f5c84c" />
          <stop offset="0.45" stopColor="#d4a72c" />
          <stop offset="1" stopColor="#8a6a1f" />
        </linearGradient>
        <filter id="sig-kincrack-glow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="2.4" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g
        stroke="url(#sig-kincrack-g)"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#sig-kincrack-glow)"
      >
        <path
          d="M258 0 L242 58 L260 96 L226 168 L238 224 L204 300 L216 352 L182 434 L196 486 L164 560 L172 640"
          strokeWidth="2.2"
        />
        <path d="M242 58 L204 84 L188 78" strokeWidth="1.1" />
        <path d="M226 168 L266 196 L282 192" strokeWidth="1.1" />
        <path d="M238 224 L268 240" strokeWidth="0.9" />
        <path d="M204 300 L168 322 L150 316" strokeWidth="1.1" />
        <path d="M182 434 L222 462 L240 458" strokeWidth="1.1" />
        <path d="M196 486 L170 502" strokeWidth="0.9" />
      </g>
      <g fill="#ffe9a8">
        <circle cx="242" cy="58" r="2.2" />
        <circle cx="226" cy="168" r="1.8" />
        <circle cx="204" cy="300" r="2.2" />
        <circle cx="182" cy="434" r="1.8" />
      </g>
    </svg>
  );
}

/** Horizontal fracture seam — section divider inside the channel card. */
export function KintsugiSeam() {
  return (
    <svg
      className="sig-seam"
      viewBox="0 0 640 18"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="sig-kinseam-g" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#8a6a1f" />
          <stop offset="0.5" stopColor="#f5c84c" />
          <stop offset="1" stopColor="#8a6a1f" />
        </linearGradient>
      </defs>
      <g stroke="url(#sig-kinseam-g)" fill="none" strokeLinecap="round">
        <path
          d="M0 10 L74 8 L118 12 L176 6 L232 11 L298 7 L342 13 L408 8 L470 12 L528 7 L584 11 L640 9"
          strokeWidth="1.5"
        />
        <path d="M176 6 L192 2" strokeWidth="0.8" />
        <path d="M342 13 L356 16" strokeWidth="0.8" />
        <path d="M408 8 L422 3" strokeWidth="0.8" />
      </g>
      <g fill="#ffe9a8">
        <circle cx="176" cy="6" r="1.6" />
        <circle cx="408" cy="8" r="1.6" />
      </g>
    </svg>
  );
}
