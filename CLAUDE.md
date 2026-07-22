# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Underdog City (theunderdogcity.com) — a transmedia dark-fantasy music IP. The
audience-facing centerpiece is the concept album **"Throne At The Bottom"**
(nu-metal / rap-metal / dark alt-R&B-metal), set in a world where a gleaming
ring-city called the Halo floats above a discarded sprawl called Underdog City,
fronted by a masked, gold-cracked figure the city calls Kazo. The album, art,
and an accompanying story (anime / web-novel style) share one canon.

## Repository layout

- `music/<playlist-slug>/` — song files, one `.txt` per track, in
  `TITLE:` / `STYLE:` / `LYRICS:` format. The `STYLE` block is written as a
  music-generation prompt (e.g. for Suno). Each playlist folder has a
  `README.md` track index. First playlist: `music/throne-at-the-bottom/`.

## Conventions & gotchas

- **This repo is PUBLIC. Never commit the story bible or any internal lore.**
  The project keeps a private story bible ("Underdog City Story Bible") whose
  contents — plot twists, hidden canon, character backstory, and any
  song-canon classifications — are deliberately withheld from fans as part of
  the project's mystery/ARG strategy. It must never appear in this repo, in
  commits, issues, or PR text. When bible context is needed, the owner pastes
  it into the session; use it as working context only. `.gitignore` blocks
  common story-bible filenames as a backstop.
- Repo content must stay at the **audience-facing** level: lyrics, style
  prompts, released art, public site copy. If something isn't already public,
  ask before committing it.
- Track filenames follow `NN - Title.txt` (zero-padded, spaced hyphen).
- A track file's internal `TITLE:` may intentionally differ from its filename
  (e.g. `09 - The Old Song.txt` is titled "Unwritten") — don't "fix" these.

## Related Claude Code config

- **Skills** live in `.claude/skills/<name>/SKILL.md` and load on demand when a
  request matches the skill's description. See `.claude/skills/example-skill/`.
- **Project settings** (permissions, hooks, env vars) go in `.claude/settings.json`.
- **Personal, un-shared** overrides go in `CLAUDE.local.md` and
  `.claude/settings.local.json` (both gitignored).
