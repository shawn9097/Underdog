---
name: example-skill
description: Example scaffold showing the structure of a SKILL.md. Replace this with a specific, trigger-focused summary of WHAT the skill does and WHEN Claude should use it — this line is how Claude decides whether to load the skill. Delete this skill once you have a real one.
---

# Example skill

This directory is a **skill** — a capability Claude Code loads *on demand*, only
when your request matches the `description` in the frontmatter above. Unlike
`CLAUDE.md` (which is always in context), a skill costs nothing until it's
triggered, which makes it the right home for specialized or lengthy procedures.

## Anatomy

- The **folder name** (`example-skill`) is the skill's identity.
- **`SKILL.md`** (singular — not `SKILLS.md`) is required. Its YAML frontmatter needs:
  - `name`: lowercase, hyphenated, matching the folder.
  - `description`: the most important field. Write it so Claude can tell, from
    this one line, when to reach for the skill. Lead with the trigger.
- Everything **below the frontmatter** is the instructions Claude follows once
  the skill loads. Write it like a focused runbook.

## Supporting files (optional)

A skill can bundle scripts, templates, or reference docs alongside this file —
e.g. `scripts/validate.py` or `reference/checklist.md`. Point to them from here
and Claude reads or runs them only when needed, so heavy detail stays out of the
main context until the moment it's relevant. This is the whole advantage of a
skill over stuffing everything into `CLAUDE.md`.

## What to do with this

Rename the folder, rewrite the frontmatter and body for a real workflow you
repeat often, or delete the entire `example-skill/` directory. It exists only to
show the shape.
