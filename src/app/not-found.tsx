import Link from "next/link";
import CityNav from "@/components/CityNav";

export default function NotFound() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "1.5rem",
        background:
          "radial-gradient(ellipse 80% 60% at 50% 120%, rgba(212,167,44,0.08), transparent), var(--void)",
        padding: "2rem",
        textAlign: "center",
      }}
    >
      <p
        style={{
          fontFamily: "var(--font-geist-mono)",
          fontSize: "0.7rem",
          letterSpacing: "0.3em",
          color: "var(--gold-dim)",
        }}
      >
        LV ---- // UNCHARTED BLOCK
      </p>
      <h1
        style={{
          fontFamily: "var(--font-boldonse)",
          fontSize: "clamp(2rem, 8vw, 5rem)",
          color: "var(--bone)",
          lineHeight: 1.1,
        }}
      >
        NOBODY RULES
        <br />
        <span style={{ color: "var(--gold)" }}>DOWN HERE YET</span>
      </h1>
      <p
        style={{
          fontFamily: "var(--font-instrument-serif)",
          fontStyle: "italic",
          fontSize: "1.15rem",
          color: "var(--halo-silver)",
          maxWidth: "34ch",
        }}
      >
        This block hasn&rsquo;t been claimed. The city is still growing.
      </p>
      <Link
        href="/"
        style={{
          fontFamily: "var(--font-geist-mono)",
          fontSize: "0.75rem",
          letterSpacing: "0.2em",
          color: "var(--gold-hot)",
          border: "1px solid var(--gold-dim)",
          padding: "0.8rem 1.6rem",
          textDecoration: "none",
        }}
      >
        ▼ RETURN TO THE DROP
      </Link>
      <CityNav />
    </main>
  );
}
