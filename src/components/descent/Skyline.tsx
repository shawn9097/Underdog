import { mulberry32 } from "./state";

/**
 * Procedural neon-and-garbage skyline of Underdog City.
 * Three silhouette layers (parallaxed by the scroll scrub in DescentPage)
 * with lit windows in district-neon colors. Deterministic generation —
 * identical markup on server and client.
 */

interface Building {
  x: number;
  w: number;
  h: number;
}
interface Win {
  x: number;
  y: number;
  w: number;
  h: number;
  fill: string;
  o: number;
}
interface Spire {
  x: number;
  y: number;
  h: number;
  light: string;
}

const NEON = ["#ff2f7e", "#29e0d4", "#8b5cf6", "#d4a72c", "#ffe9a8"];
const H = 380;

function layer(
  seed: number,
  hMin: number,
  hMax: number,
  wMin: number,
  wMax: number,
  winPer: number,
  spires: boolean
) {
  const rnd = mulberry32(seed);
  const buildings: Building[] = [];
  const wins: Win[] = [];
  const sp: Spire[] = [];
  let x = -12;
  while (x < 1452) {
    const w = wMin + rnd() * (wMax - wMin);
    const h = hMin + rnd() * (hMax - hMin);
    buildings.push({ x, w, h });
    const top = H - h;
    const cols = Math.max(1, Math.floor(w / 14));
    const n = 1 + Math.floor(rnd() * winPer);
    for (let i = 0; i < n; i++) {
      const wx = x + 4 + Math.floor(rnd() * cols) * 14;
      const wy = top + 8 + rnd() * (h - 26);
      if (wx + 5 < x + w - 3) {
        wins.push({
          x: wx,
          y: wy,
          w: 4 + rnd() * 3,
          h: 5 + rnd() * 4,
          fill: NEON[Math.floor(rnd() * NEON.length)],
          o: 0.4 + rnd() * 0.55,
        });
      }
    }
    if (spires && rnd() < 0.3) {
      sp.push({
        x: x + w * (0.25 + rnd() * 0.5),
        y: top,
        h: 16 + rnd() * 34,
        light: rnd() < 0.5 ? "#ff2f7e" : "#29e0d4",
      });
    }
    x += w + rnd() * 8;
  }
  return { buildings, wins, sp };
}

const FAR = layer(11, 70, 170, 34, 78, 6, false);
const MID = layer(23, 110, 245, 40, 92, 9, true);
const NEAR = layer(47, 150, 320, 52, 120, 15, true);

function Layer({
  id,
  data,
  fill,
  winScale,
}: {
  id: string;
  data: ReturnType<typeof layer>;
  fill: string;
  winScale: number;
}) {
  return (
    <g id={id}>
      {data.buildings.map((b, i) => (
        <rect
          key={`b${i}`}
          x={b.x.toFixed(1)}
          y={(H - b.h).toFixed(1)}
          width={b.w.toFixed(1)}
          height={(b.h + 24).toFixed(1)}
          fill={fill}
        />
      ))}
      {data.sp.map((s, i) => (
        <g key={`s${i}`}>
          <rect
            x={(s.x - 1).toFixed(1)}
            y={(s.y - s.h).toFixed(1)}
            width="2"
            height={s.h.toFixed(1)}
            fill={fill}
          />
          <circle
            cx={s.x.toFixed(1)}
            cy={(s.y - s.h).toFixed(1)}
            r="2.2"
            fill={s.light}
            opacity="0.9"
          />
        </g>
      ))}
      {data.wins.map((w, i) => (
        <rect
          key={`w${i}`}
          x={w.x.toFixed(1)}
          y={w.y.toFixed(1)}
          width={(w.w * winScale).toFixed(1)}
          height={(w.h * winScale).toFixed(1)}
          fill={w.fill}
          opacity={w.o.toFixed(2)}
        />
      ))}
    </g>
  );
}

export default function Skyline() {
  return (
    <div className="relative w-full" aria-hidden="true">
      <svg
        viewBox={`0 0 1440 ${H}`}
        preserveAspectRatio="xMidYMax slice"
        className="block h-[44vh] min-h-[280px] w-full"
      >
        <defs>
          {/* light pollution rising off the districts */}
          <linearGradient id="sky-smog" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="rgba(139,92,246,0)" />
            <stop offset="0.55" stopColor="rgba(255,47,126,0.07)" />
            <stop offset="0.82" stopColor="rgba(255,47,126,0.16)" />
            <stop offset="1" stopColor="rgba(139,92,246,0.24)" />
          </linearGradient>
        </defs>
        <rect x="0" y="40" width="1440" height={H - 40} fill="url(#sky-smog)" />
        <Layer id="sky-far" data={FAR} fill="#17121e" winScale={0.7} />
        <Layer id="sky-mid" data={MID} fill="#0d0a12" winScale={0.85} />
        <Layer id="sky-near" data={NEAR} fill="#060508" winScale={1} />
      </svg>
    </div>
  );
}
