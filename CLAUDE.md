# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

**Underdog City** is a transmedia dark-fantasy IP fronted by a masked, anonymous
music artist. The music, the story (anime/novel), and the brand are **one
object**, not three projects. Debut album: *Throne at the Bottom* (Cenotaph
Records, 14 tracks, releases July 31, 2026).

**Thesis:** the world throws people away; down here, the broken discover that
broken things hold the most power — and build a kingdom out of everything that
was discarded. *"We all rule down here."*

The full brand + story + music bible lives in
[`docs/underdog-city-brief.md`](docs/underdog-city-brief.md). Verbatim song
lyrics + style boxes are in [`docs/songbook/`](docs/songbook/). This file stays
lean on purpose — read those for detail before doing story, brand, or lyric work.

## Commands

<!-- No code yet — this is a lore/brand repo plus `.claude/skills/`. A pre-release
     website build (email capture) is planned; fill this in once that scaffold exists. -->

## Architecture

- `docs/underdog-city-brief.md` — the single source of truth (brand core, story
  world, KINTSUGI magic system, the MC, and the *Throne at the Bottom* tracklist).
- `docs/songbook/` — one `.txt` per track, verbatim (TITLE / STYLE / LYRICS).
- `.claude/skills/` — design & tooling skills (see below).

## Conventions & gotchas

- **The brief is authoritative over older notes.** The song catalog was corrected
  against the actual playlist: "Saints" → **No Saints**, "Sinners" → **Lights Go
  Low**, the old "Monster" song → **Villain**. Don't reintroduce dropped working
  titles (The House, Atrophy, After the Fire, etc.) as if current.
- **Tone:** dark, defiant, cathartic, anti-redemption, found-family heart under a
  hard shell. Keep brand/story copy in that voice.
- **The mask stays on** — the artist is anonymous; never imply a revealed face.
- **The Old Song** (track 9) is the renamed **Unwritten**; the cut track was
  **Prey**. Don't list Prey or a standalone "Unwritten" as current.

## Related Claude Code config

- **Skills** live in `.claude/skills/<name>/SKILL.md` and load on demand when a
  request matches the skill's description. See `.claude/skills/example-skill/`.
- **Project settings** (permissions, hooks, env vars) go in `.claude/settings.json`.
- **Personal, un-shared** overrides go in `CLAUDE.local.md` and
  `.claude/settings.local.json` (both gitignored).
