"use client";

/**
 * Kintsugi crack overlay — the brand signature. Gold fracture lines
 * spider across the viewport as the Worth Index is spent. Reveal is
 * pure CSS (stroke-dashoffset driven by the stage attribute), so it
 * costs nothing per frame.
 */
export default function CrackOverlay() {
  return (
    <svg
      className="hl-cracks"
      viewBox="0 0 1440 900"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      {/* stage 1 — hairlines creep in from the edges */}
      <g className="hl-crack-g1">
        <path pathLength={100} d="M -10 118 L 128 148 L 176 132 L 262 189 L 305 178 L 388 236" />
        <path pathLength={100} className="hl-crack-fine" d="M 176 132 L 208 96 L 247 88" />
        <path pathLength={100} d="M 1450 704 L 1345 676 L 1302 693 L 1208 636 L 1148 648 L 1073 590" />
        <path pathLength={100} className="hl-crack-fine" d="M 1208 636 L 1188 682 L 1136 706" />
      </g>
      {/* stage 2 — the fracture reaches the middle */}
      <g className="hl-crack-g2">
        <path
          pathLength={100}
          d="M 388 236 L 452 302 L 441 348 L 540 421 L 592 415 L 668 489 L 723 481 L 786 543"
        />
        <path pathLength={100} className="hl-crack-fine" d="M 540 421 L 512 470 L 528 522" />
        <path pathLength={100} className="hl-crack-fine" d="M 668 489 L 683 434 L 663 396" />
        <path pathLength={100} d="M 1450 96 L 1332 141 L 1284 128 L 1189 196 L 1147 190 L 1066 251" />
        <path pathLength={100} d="M -10 782 L 96 741 L 141 756 L 238 690 L 287 701 L 352 646" />
        <path pathLength={100} className="hl-crack-fine" d="M 238 690 L 231 744 L 196 778" />
      </g>
      {/* stage 3 — it all meets, and the gold takes over */}
      <g className="hl-crack-g3">
        <path
          pathLength={100}
          d="M 786 543 L 851 594 L 909 588 L 968 651 L 1014 644 L 1073 590"
        />
        <path
          pathLength={100}
          d="M 723 481 L 741 402 L 712 341 L 748 268 L 731 208 L 762 128 L 749 62 L 771 -10"
        />
        <path pathLength={100} className="hl-crack-fine" d="M 741 402 L 802 384 L 838 341" />
        <path pathLength={100} className="hl-crack-fine" d="M 748 268 L 692 246 L 655 204" />
        <path
          pathLength={100}
          d="M 786 543 L 764 618 L 792 686 L 758 762 L 781 824 L 756 910"
        />
        <path pathLength={100} className="hl-crack-fine" d="M 792 686 L 856 704 L 892 748" />
        <path pathLength={100} className="hl-crack-fine" d="M 758 762 L 702 780 L 668 826" />
        <path pathLength={100} d="M 1066 251 L 989 306 L 934 298 L 862 356 L 838 341" />
        <path pathLength={100} d="M 352 646 L 428 596 L 486 606 L 528 522" />
      </g>
    </svg>
  );
}
