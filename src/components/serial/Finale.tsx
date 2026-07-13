"use client";

/**
 * The chapter finale line + the quiet title card. All copy arrives verbatim
 * via the chapter config: the finale line is a chapter paragraph; the sung
 * lines come from the scored track in @/lib/album. A " / " inside a line is
 * the songbook's line-break convention, rendered as two lines here.
 */

export default function Finale({
  text,
  kicker,
  meta,
  lines,
}: {
  text: string;
  kicker: string;
  meta: string;
  lines: string[];
}) {
  return (
    <section className="pl-finale-wrap" aria-label="Finale">
      <h2 className="pl-finale" data-anchor="finale" aria-label={text}>
        {Array.from(text).map((ch, k) => (
          <span key={k} className="pl-fin-letter" aria-hidden="true">
            {ch === " " ? " " : ch}
          </span>
        ))}
      </h2>

      <div className="pl-titlecard" data-reveal>
        <p className="pl-tc-kicker">{kicker}</p>
        <p className="pl-tc-meta">{meta}</p>
        <div className="pl-tc-lines">
          {lines.map((line, i) => (
            <p className="pl-tc-line" key={i}>
              {line.split(" / ").map((part, j) => (
                <span key={j}>{part}</span>
              ))}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
