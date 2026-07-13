/**
 * Kintsugi gold for THE MUSIC ROOM — the brand fracture motif rendered as
 * the sealed masters-vault door and as repaired seams in the room's walls.
 * (Seam artwork absorbed from THE SIGNAL when that surface folded in.)
 */

/** Horizontal fracture seam — section divider repaired with gold. */
export function Seam({ className }: { className?: string }) {
  return (
    <svg
      className={className ?? "mu-seam"}
      viewBox="0 0 640 18"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="mu-seam-g" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#8a6a1f" />
          <stop offset="0.5" stopColor="#f5c84c" />
          <stop offset="1" stopColor="#8a6a1f" />
        </linearGradient>
      </defs>
      <g stroke="url(#mu-seam-g)" fill="none" strokeLinecap="round">
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

/** Tall wall fracture — ambient gold vein for the room's edges. */
export function WallVein({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 320 640"
      aria-hidden="true"
      focusable="false"
      preserveAspectRatio="xMaxYMin meet"
    >
      <defs>
        <linearGradient id="mu-vein-g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f5c84c" />
          <stop offset="0.45" stopColor="#d4a72c" />
          <stop offset="1" stopColor="#8a6a1f" />
        </linearGradient>
        <filter id="mu-vein-glow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="2.4" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g
        stroke="url(#mu-vein-g)"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#mu-vein-glow)"
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

/**
 * The sealed masters-vault door. Two lacquered leaves, a locking wheel,
 * and kintsugi gold running through every fracture the city couldn't hide.
 * Pure artwork — all live text is HTML layered above it.
 */
export function VaultDoor({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 720 940"
      aria-hidden="true"
      focusable="false"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <linearGradient id="mu-door-gold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f5c84c" />
          <stop offset="0.5" stopColor="#d4a72c" />
          <stop offset="1" stopColor="#8a6a1f" />
        </linearGradient>
        <linearGradient id="mu-door-face" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#16131b" />
          <stop offset="0.55" stopColor="#0e0c11" />
          <stop offset="1" stopColor="#080609" />
        </linearGradient>
        <radialGradient id="mu-door-sheen" cx="0.5" cy="0.36" r="0.75">
          <stop offset="0" stopColor="rgba(245,200,76,0.10)" />
          <stop offset="0.55" stopColor="rgba(245,200,76,0.03)" />
          <stop offset="1" stopColor="rgba(245,200,76,0)" />
        </radialGradient>
        <filter id="mu-door-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="2.6" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* outer frame */}
      <rect x="10" y="10" width="700" height="920" fill="none" stroke="rgba(212,167,44,0.28)" strokeWidth="2" />
      <rect x="34" y="34" width="652" height="872" fill="url(#mu-door-face)" stroke="rgba(212,167,44,0.5)" strokeWidth="1.6" />
      <rect x="34" y="34" width="652" height="872" fill="url(#mu-door-sheen)" />

      {/* frame rivets */}
      <g fill="rgba(212,167,44,0.55)">
        {[70, 170, 270, 370, 470, 570, 650, 770, 870].map((y) => (
          <g key={y}>
            <circle cx="22" cy={y} r="2.6" />
            <circle cx="698" cy={y} r="2.6" />
          </g>
        ))}
        {[90, 210, 330, 450, 510, 630].map((x) => (
          <g key={x}>
            <circle cx={x} cy="22" r="2.6" />
            <circle cx={x} cy="918" r="2.6" />
          </g>
        ))}
      </g>

      {/* leaf panelling */}
      <g stroke="rgba(212,167,44,0.16)" fill="none" strokeWidth="1.2">
        <rect x="64" y="64" width="272" height="812" />
        <rect x="384" y="64" width="272" height="812" />
        <rect x="92" y="92" width="216" height="756" />
        <rect x="412" y="92" width="216" height="756" />
      </g>

      {/* central seam — the fracture the gold repaired */}
      <g filter="url(#mu-door-glow)" data-veins>
        <path
          className="mu-door-vein"
          d="M360 34 L354 96 L366 148 L352 226 L364 288 L350 372 L362 448 L348 540 L362 620 L350 700 L360 780 L354 906"
          stroke="url(#mu-door-gold)"
          strokeWidth="2.6"
          fill="none"
          strokeLinecap="round"
        />
        <path className="mu-door-vein" d="M354 96 L312 128 L294 122" stroke="url(#mu-door-gold)" strokeWidth="1.2" fill="none" />
        <path className="mu-door-vein" d="M366 148 L414 176 L436 170" stroke="url(#mu-door-gold)" strokeWidth="1.2" fill="none" />
        <path className="mu-door-vein" d="M352 226 L300 262 L282 258" stroke="url(#mu-door-gold)" strokeWidth="1.1" fill="none" />
        <path className="mu-door-vein" d="M350 372 L286 344 L262 350" stroke="url(#mu-door-gold)" strokeWidth="1.2" fill="none" />
        <path className="mu-door-vein" d="M362 448 L428 478 L452 472" stroke="url(#mu-door-gold)" strokeWidth="1.2" fill="none" />
        <path className="mu-door-vein" d="M348 540 L296 578 L276 574" stroke="url(#mu-door-gold)" strokeWidth="1.1" fill="none" />
        <path className="mu-door-vein" d="M362 620 L420 654" stroke="url(#mu-door-gold)" strokeWidth="1" fill="none" />
        <path className="mu-door-vein" d="M350 700 L302 736 L286 732" stroke="url(#mu-door-gold)" strokeWidth="1.1" fill="none" />
        <path className="mu-door-vein" d="M360 780 L410 812" stroke="url(#mu-door-gold)" strokeWidth="1" fill="none" />
      </g>

      {/* gold nodes where the veins knot */}
      <g fill="#ffe9a8">
        <circle cx="354" cy="96" r="2.4" />
        <circle cx="352" cy="226" r="2" />
        <circle cx="350" cy="372" r="2.4" />
        <circle cx="348" cy="540" r="2" />
        <circle cx="350" cy="700" r="2.2" />
      </g>

      {/* locking wheel */}
      <g className="mu-door-wheel">
        <circle cx="360" cy="330" r="128" fill="rgba(6,5,7,0.65)" stroke="rgba(212,167,44,0.65)" strokeWidth="2.2" />
        <circle cx="360" cy="330" r="100" fill="none" stroke="rgba(212,167,44,0.3)" strokeWidth="1.2" />
        <circle cx="360" cy="330" r="30" fill="none" stroke="url(#mu-door-gold)" strokeWidth="2" />
        {Array.from({ length: 8 }, (_, i) => {
          const a = (i * Math.PI) / 4;
          const x1 = 360 + Math.cos(a) * 32;
          const y1 = 330 + Math.sin(a) * 32;
          const x2 = 360 + Math.cos(a) * 98;
          const y2 = 330 + Math.sin(a) * 98;
          return (
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(212,167,44,0.55)" strokeWidth="2.4" strokeLinecap="round" />
          );
        })}
        {Array.from({ length: 12 }, (_, i) => {
          const a = (i * Math.PI) / 6;
          const x = 360 + Math.cos(a) * 114;
          const y = 330 + Math.sin(a) * 114;
          return <circle key={i} cx={x} cy={y} r="2.2" fill="rgba(245,200,76,0.6)" />;
        })}
        {/* keyhole */}
        <circle cx="360" cy="322" r="9" fill="#060507" stroke="#f5c84c" strokeWidth="1.6" />
        <path d="M356 328 L353 352 L367 352 L364 328 Z" fill="#060507" stroke="#f5c84c" strokeWidth="1.6" strokeLinejoin="round" />
      </g>

      {/* hinges */}
      <g fill="rgba(212,167,44,0.4)">
        <rect x="34" y="150" width="14" height="56" />
        <rect x="34" y="440" width="14" height="56" />
        <rect x="34" y="730" width="14" height="56" />
        <rect x="672" y="150" width="14" height="56" />
        <rect x="672" y="440" width="14" height="56" />
        <rect x="672" y="730" width="14" height="56" />
      </g>
    </svg>
  );
}
