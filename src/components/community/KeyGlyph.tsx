"use client";

import { useId, useMemo } from "react";
import { bowCrackSvgPath, keyShape, keySvgPath } from "./ritual";

interface Props {
  bitting: number[];
  seed: number;
  className?: string;
  title?: string;
}

/**
 * The visitor's key as an SVG — broken-crown bow, stem, and the six
 * bitting teeth cut from their fracture seed. The seeded kintsugi wound
 * stays visible across the bow.
 */
export default function KeyGlyph({ bitting, seed, className, title }: Props) {
  const rawId = useId();
  const gid = useMemo(() => `kg-${rawId.replace(/[^a-zA-Z0-9_-]/g, "")}`, [rawId]);
  const d = useMemo(() => keySvgPath(keyShape(bitting)), [bitting]);
  const wound = useMemo(() => bowCrackSvgPath(seed), [seed]);

  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
    >
      {title ? <title>{title}</title> : null}
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffe9a8" />
          <stop offset="45%" stopColor="#d4a72c" />
          <stop offset="100%" stopColor="#8a6a1f" />
        </linearGradient>
        <clipPath id={`${gid}-clip`}>
          <path d={d} clipRule="evenodd" />
        </clipPath>
      </defs>
      <path d={d} fillRule="evenodd" fill={`url(#${gid})`} />
      <path
        d={d}
        fillRule="evenodd"
        fill="none"
        stroke="#ffe9a8"
        strokeOpacity="0.5"
        strokeWidth="0.5"
      />
      <g clipPath={`url(#${gid}-clip)`}>
        <path
          d={wound}
          fill="none"
          stroke="#060507"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}
