# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Underdog City — transmedia dark-fantasy music IP (album *Throne at the Bottom*,
out 2026-07-31, Cenotaph Records). This repo is the Next.js site behind
theunderdogcity.com: a front door (`/`) plus three destinations — THE SERIAL
(`/serial`, chapter reader), THE MUSIC (`/music`, countdown-gated album +
early-access player), THE COMMUNITY (`/community`, claim-your-key ritual +
tenant wall) — and THE HALO (`/halo`, lore page).

## Commands

- `npm run dev` / `npm run build` / `npm run start`
- `node scripts/verify.mjs --routes /,/serial --out shots/x --scroll [--mobile]`
  — Playwright console-error gate + screenshots (zero errors required)
- `node scripts/gen-lyrics.mjs` — regenerate `src/lib/lyrics.ts` from `docs/songbook/`
- `SUPABASE_SERVICE_ROLE_KEY=... node scripts/ingest-masters.mjs manifest.json`
  — upload album audio into the private `masters` bucket

## Architecture

- **Canon:** `docs/underdog-city-brief.md` + `docs/songbook/*.txt` are the
  absolute source of truth for all copy/lore. Typed mirror: `src/lib/album.ts`
  (BRAND, WORLD, TRACKS, PROLOGUE, CHAPTERS, TRACK_ARCS, LINKS, SOCIALS) and
  generated `src/lib/lyrics.ts`. Never invent lyrics, lore, links, or dates.
- **Backend:** Supabase project `underdog-city` (ref `dnvynfthisoctkjayxuc`).
  Client: `src/lib/backend.ts` (plain fetch; anon key is public by design —
  security is RLS + column grants + SECURITY DEFINER RPCs `claim_tenancy` /
  `leave_mark` / `get_tenant_count`; posts guarded by rate-limit/link/slur
  triggers). Private `masters` storage bucket; `unlock` edge function issues
  signed playback URLs (auto-opens post-release); `subscribe` syncs Beehiiv
  (activates once the `config` table holds `beehiiv_api_key` +
  `beehiiv_publication_id`).
- **Tenancy on the client:** localStorage `uc:key-claim:v2` JSON
  `{ alias, email, seed, bitting, deedId, depth, issuedISO, tenantNumber, tenantKey }`.
  `/music` reads it to unlock early access pre-release.
- **Fonts:** local OFL files via `src/lib/fonts.ts` (CSS vars on `<html>`).
  Global nav `src/components/CityNav.tsx` renders once from `layout.tsx`.

## Conventions & gotchas

- Zero console errors/warnings is a hard gate (see verify.mjs); check desktop
  1440 AND mobile 390.
- All gate/storage/live-value logic runs client-side after mount (SSR-safe);
  respect `prefers-reduced-motion` (globals.css hard-disables CSS animations).
- Old routes `/signal`, `/prologue`, `/key` are permanent redirects — don't
  recreate pages there.
- Deploys: Vercel project `underdogcity` (owns theunderdogcity.com) builds via
  an installCommand that clones this repo's branch — the repo must stay public
  or the build breaks.

## Related Claude Code config

- **Skills** live in `.claude/skills/<name>/SKILL.md` and load on demand when a
  request matches the skill's description. See `.claude/skills/example-skill/`.
- **Project settings** (permissions, hooks, env vars) go in `.claude/settings.json`.
- **Personal, un-shared** overrides go in `CLAUDE.local.md` and
  `.claude/settings.local.json` (both gitignored).
