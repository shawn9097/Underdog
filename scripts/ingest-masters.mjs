/**
 * Ingest album masters into the private Supabase `masters` bucket.
 *
 * Usage:
 *   SUPABASE_SERVICE_ROLE_KEY=... node scripts/ingest-masters.mjs manifest.json
 *
 * manifest.json maps track slugs to source URLs (or local file paths):
 *   { "villain": "https://.../01.mp3", "down-here": "/path/02.mp3", ... }
 *
 * Files are stored as <slug>.<ext> so the `unlock` edge function's signed
 * URLs key cleanly by slug. Requires the service-role key because the bucket
 * is private by design — never commit that key.
 */
import { readFileSync } from "node:fs";

const PROJECT_URL = "https://dnvynfthisoctkjayxuc.supabase.co";
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const manifestPath = process.argv[2];

if (!SERVICE_KEY) {
  console.error("Set SUPABASE_SERVICE_ROLE_KEY (Supabase dashboard → Settings → API).");
  process.exit(1);
}
if (!manifestPath) {
  console.error("Usage: node scripts/ingest-masters.mjs manifest.json");
  process.exit(1);
}

const SLUGS = [
  "villain", "down-here", "who-tf", "chaos", "stupid-little-bitch",
  "lights-go-low", "no-saints", "upbeat-gospel", "the-old-song", "the-truth",
  "parasitic-love", "came-back-wrong", "throne-at-the-bottom", "apathy-vs-agony",
];

const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));

function extFor(url, contentType) {
  const m = url.split("?")[0].match(/\.([a-z0-9]{2,5})$/i);
  if (m) return m[1].toLowerCase();
  if (contentType?.includes("mpeg")) return "mp3";
  if (contentType?.includes("wav")) return "wav";
  if (contentType?.includes("flac")) return "flac";
  if (contentType?.includes("mp4") || contentType?.includes("m4a")) return "m4a";
  return "mp3";
}

let ok = 0;
for (const slug of SLUGS) {
  const src = manifest[slug];
  if (!src) {
    console.log(`— ${slug}: not in manifest, skipped`);
    continue;
  }
  let bytes, contentType;
  if (/^https?:\/\//i.test(src)) {
    const res = await fetch(src);
    if (!res.ok) {
      console.error(`✗ ${slug}: fetch failed ${res.status}`);
      continue;
    }
    contentType = res.headers.get("content-type") ?? undefined;
    bytes = Buffer.from(await res.arrayBuffer());
  } else {
    bytes = readFileSync(src);
  }
  const ext = extFor(src, contentType);
  const dest = `${slug}.${ext}`;
  const up = await fetch(
    `${PROJECT_URL}/storage/v1/object/masters/${dest}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SERVICE_KEY}`,
        "Content-Type": contentType ?? "audio/mpeg",
        "x-upsert": "true",
      },
      body: bytes,
    },
  );
  if (up.ok) {
    ok++;
    console.log(`✓ ${slug} → masters/${dest} (${(bytes.length / 1048576).toFixed(1)} MB)`);
  } else {
    console.error(`✗ ${slug}: upload failed ${up.status} ${await up.text()}`);
  }
}
console.log(`\n${ok}/${SLUGS.length} masters ingested. The player lights up automatically.`);
