import { mulberry32 } from "./state";

/**
 * Full-viewport kintsugi fracture. Paths are generated deterministically at
 * module scope (same on server and client — hydration safe). By default the
 * cracks render fully drawn (no-JS / reduced-motion); the scroll scrub in
 * DescentPage sets stroke-dash state and animates the gold flooding in.
 */

interface Crack {
  d: string;
  w: number;
}

function generate(): { cores: Crack[]; glows: Crack[] } {
  const rnd = mulberry32(20260731);
  const cracks: Crack[] = [];

  const grow = (
    x: number,
    y: number,
    ang: number,
    len: number,
    w: number,
    depth: number
  ) => {
    let d = `M${x.toFixed(1)} ${y.toFixed(1)}`;
    const segs = 5 + Math.floor(rnd() * 5);
    for (let s = 0; s < segs; s++) {
      ang += (rnd() - 0.5) * 1.05;
      x += Math.cos(ang) * len;
      y += Math.sin(ang) * len;
      d += ` L${x.toFixed(1)} ${y.toFixed(1)}`;
      len *= 0.93;
      if (depth < 2 && rnd() < 0.28) {
        grow(
          x,
          y,
          ang + (rnd() < 0.5 ? 1 : -1) * (0.55 + rnd() * 0.8),
          len * 0.68,
          w * 0.5,
          depth + 1
        );
      }
    }
    cracks.push({ d, w });
  };

  const mains = 9;
  for (let i = 0; i < mains; i++) {
    const ang = (i / mains) * Math.PI * 2 + (rnd() - 0.5) * 0.5;
    grow(
      500 + (rnd() - 0.5) * 26,
      570 + (rnd() - 0.5) * 26,
      ang,
      44 + rnd() * 42,
      2.4 + rnd() * 2.6,
      0
    );
  }
  return { cores: cracks, glows: cracks };
}

const CRACKS = generate();

export default function KintsugiCrack() {
  return (
    <svg
      id="kintsugi-svg"
      className="absolute inset-0 h-full w-full"
      viewBox="0 0 1000 1120"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id="kgold"
          gradientUnits="userSpaceOnUse"
          x1="140"
          y1="120"
          x2="880"
          y2="1040"
        >
          <stop offset="0" stopColor="#8a6a1f" />
          <stop offset="0.42" stopColor="#d4a72c" />
          <stop offset="0.7" stopColor="#f5c84c" />
          <stop offset="1" stopColor="#ffe9a8" />
        </linearGradient>
        <radialGradient id="kpool" cx="0.5" cy="0.52" r="0.5">
          <stop offset="0" stopColor="rgba(245,200,76,0.5)" />
          <stop offset="0.4" stopColor="rgba(212,167,44,0.16)" />
          <stop offset="1" stopColor="rgba(6,5,7,0)" />
        </radialGradient>
      </defs>
      {/* molten pool beneath the fracture — floods in with the gold */}
      <rect
        id="kpool-fill"
        x="0"
        y="0"
        width="1000"
        height="1120"
        fill="url(#kpool)"
      />
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        <g>
          {CRACKS.glows.map((c, i) => (
            <path
              key={`g${i}`}
              className="crack-glow"
              d={c.d}
              stroke="#d4a72c"
              strokeOpacity={0.24}
              strokeWidth={c.w * 5.4}
            />
          ))}
        </g>
        <g>
          {CRACKS.cores.map((c, i) => (
            <path
              key={`c${i}`}
              className="crack-core"
              d={c.d}
              stroke="url(#kgold)"
              strokeWidth={c.w}
            />
          ))}
        </g>
      </g>
    </svg>
  );
}
