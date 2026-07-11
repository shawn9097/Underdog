# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Underdog — <!-- TODO: one or two sentences on what this project is and does. -->

<!--
This file is loaded into Claude's context at the START OF EVERY SESSION, so keep
it lean and high-signal. Document what's true across the whole repo and would
otherwise have to be rediscovered each time. Fill in the TODOs below and delete
the markers; remove any section that doesn't apply. Push long or specialized
detail into `.claude/skills/` or a separate doc you @import, not into here.
-->

## Commands

<!-- TODO: the handful of commands used most while developing here, e.g.: -->
<!--   Install deps:      -->
<!--   Build:             -->
<!--   Run / dev server:  -->
<!--   Lint / format:     -->
<!--   Test (all):        -->
<!--   Test (single):     the exact incantation to run ONE test — easy to forget -->

## Architecture

<!-- TODO: the big-picture structure that spans multiple files — the stuff that
     ISN'T obvious from reading any single file. What are the main pieces, how do
     they talk to each other, where does a request/data flow begin and end, which
     directories hold what. Capture the non-obvious; skip what's self-evident. -->

## Conventions & gotchas

<!-- TODO: project-specific rules and surprises. Naming patterns, "always do X
     before Y", things that look wrong but are intentional, footguns to avoid. -->

## Related Claude Code config

- **Skills** live in `.claude/skills/<name>/SKILL.md` and load on demand when a
  request matches the skill's description. See `.claude/skills/example-skill/`.
- **Project settings** (permissions, hooks, env vars) go in `.claude/settings.json`.
- **Personal, un-shared** overrides go in `CLAUDE.local.md` and
  `.claude/settings.local.json` (both gitignored).
