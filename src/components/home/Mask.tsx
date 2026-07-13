/**
 * The mask — matte-black, fractured with gold veins. The brand's face.
 * Hand-authored SVG (kintsugi: glow strokes under gold cores, the same
 * grammar as the impact fracture on the old descent). Static markup,
 * hydration-safe; HomePage animates the `.mask-*` hooks.
 */

const VEINS = [
  "M124 12 L118 36 L127 54 L112 74 L97 85 L90 97",
  "M96 237 L102 210 L91 186 L102 160 L95 143",
  "M167 116 L151 127 L145 147 L129 156",
  "M35 79 L48 88 L46 102 L54 111",
];

const BRANCHES = [
  "M127 54 L141 63 L138 82",
  "M118 36 L107 41",
  "M91 186 L76 176 L71 161",
  "M145 147 L151 165",
];

const HAIRLINES = [
  "M62 34 L72 52 L66 70",
  "M138 198 L127 212",
  "M83 226 L88 214",
  "M158 74 L149 88",
];

const PLATE =
  "M100 10 C144 10 170 42 170 92 C170 150 146 208 100 240 C54 208 30 150 30 92 C30 42 56 10 100 10 Z";

export default function Mask({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 250"
      role="img"
      aria-label="The mask of Underdog City — matte black, fractured with gold veins"
      className={className}
      style={{
        display: "block",
        width: "100%",
        height: "auto",
        filter:
          "drop-shadow(0 20px 44px rgba(0,0,0,0.7)) drop-shadow(0 0 30px rgba(212,167,44,0.14))",
      }}
    >
      <defs>
        <linearGradient
          id="udcm-gold"
          x1="40"
          y1="20"
          x2="160"
          y2="230"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#8a6a1f" />
          <stop offset="0.45" stopColor="#d4a72c" />
          <stop offset="0.72" stopColor="#f5c84c" />
          <stop offset="1" stopColor="#ffe9a8" />
        </linearGradient>
        <linearGradient
          id="udcm-plate"
          x1="100"
          y1="10"
          x2="100"
          y2="240"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#1c1824" />
          <stop offset="0.5" stopColor="#120f18" />
          <stop offset="1" stopColor="#0a080d" />
        </linearGradient>
        <radialGradient id="udcm-sheen" cx="0.38" cy="0.2" r="0.62">
          <stop offset="0" stopColor="rgba(201,210,220,0.13)" />
          <stop offset="1" stopColor="rgba(201,210,220,0)" />
        </radialGradient>
        <radialGradient id="udcm-eyeglow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="rgba(245,200,76,0.55)" />
          <stop offset="1" stopColor="rgba(245,200,76,0)" />
        </radialGradient>
      </defs>

      {/* the plate */}
      <path d={PLATE} fill="url(#udcm-plate)" />
      <path d={PLATE} fill="url(#udcm-sheen)" />

      {/* dead fractures — cracks the gold never reached */}
      <g
        fill="none"
        stroke="#252031"
        strokeWidth="0.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {HAIRLINES.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>

      {/* something gold, and patient, behind the eyes */}
      <circle
        className="mask-eye udc-kindle"
        cx="67"
        cy="108"
        r="17"
        fill="url(#udcm-eyeglow)"
        opacity="0.4"
      />
      <circle
        className="mask-eye udc-kindle"
        cx="133"
        cy="108"
        r="17"
        fill="url(#udcm-eyeglow)"
        opacity="0.4"
      />

      {/* eye slits */}
      <g fill="#030204" stroke="#221d29" strokeWidth="0.75">
        <path d="M49 99 L86 106 L84 117 L51 109 Z" />
        <path d="M151 99 L114 106 L116 117 L149 109 Z" />
      </g>
      <g
        className="mask-gleam"
        stroke="#f5c84c"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.55"
      >
        <path d="M54 108 L82 114" />
        <path d="M146 108 L118 114" />
      </g>

      {/* kintsugi veins — glow beneath, molten core above */}
      <g
        className="mask-vein-glow"
        fill="none"
        stroke="#d4a72c"
        strokeOpacity="0.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {[...VEINS, ...BRANCHES].map((d) => (
          <path key={d} d={d} strokeWidth="5.5" />
        ))}
      </g>
      <g
        className="mask-vein"
        fill="none"
        stroke="url(#udcm-gold)"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {VEINS.map((d) => (
          <path key={d} d={d} strokeWidth="1.9" />
        ))}
        {BRANCHES.map((d) => (
          <path key={d} d={d} strokeWidth="1.1" />
        ))}
      </g>

      {/* rim + a gold glint caught on the chin */}
      <path d={PLATE} fill="none" stroke="#2f2a38" strokeWidth="1.4" />
      <path
        d="M64 205 C78 226 90 234 100 239"
        fill="none"
        stroke="url(#udcm-gold)"
        strokeWidth="1"
        opacity="0.35"
        strokeLinecap="round"
      />
    </svg>
  );
}
