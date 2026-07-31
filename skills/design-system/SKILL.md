---
name: design-system
description: Use when writing or reviewing any UI code for one of Gleb's projects — components, layouts, styles, themes, landing pages, dashboards, CMS admin. This is the Crafted Minimal design system (semantic tokens, type/spacing scales, contrast floor, motion rules) that every project adopts. Load it BEFORE writing markup or CSS, and when picking colors, sizing type, spacing a layout, theming a client site, or verifying accessibility. Complements the good-eye skill: good-eye supplies visual references, this supplies the actual token contract.
---

# Crafted Minimal — the design system

The unified system for everything Gleb ships: personal tools, open source, CMS admin, client sites.
This skill is the METHOD. The source of truth is the repo's own files — **read them, don't recite this page.**

The lane: near-monochrome, type-led, keyboard-first. Personality comes from motion, interaction craft
and restraint, never from decoration. One electric accent that appears only in interactive moments.
Lists over cards. If a page looks quiet at first glance and rewards attention on the second, it's on brand.

## Always read the source first

Values drift; this file must not carry them. At the start of any UI task, read from the plugin root:

- **`design.md`** — the full system: the two layers, color tokens (light + dark tables), typography,
  spacing/radius/borders/shadows, motion, hard rules, surface archetypes, core components, theming guide.
- **`tokens.css`** — the actual custom properties to copy into a project. It also resets Tailwind's
  default palette, which is what mechanically enforces "no raw hex".
- **`contrast.py`** — run `python3 contrast.py` to verify any theme against the contrast floor with
  math instead of eyes.

Never hardcode a palette value into a plan, a spec, or another memory. Grep the repo fresh each session.

## The two layers

**Core never changes per project:** semantic token *names* and meanings, spacing scale, type scale,
prose measure, the contrast floor, motion character (durations, easings, reduced-motion), and component
behavior (focus handling, touch targets, keyboard affordances).

**Theme swaps per project:** the *values* behind the color tokens (light + dark sets), font choices
(default Geist Sans / Geist Mono), corner radii, logo and imagery.

Gleb's own products, open source, and admin UIs use the default Gleb theme. A client site gets its own
theme file reassigning the same variables. Nothing else about the system moves.

## Hard rules — non-negotiable, every project, every theme

1. **Contrast floor:** no text token below 4.5:1 on `bg` or `elevated`. Verify with `contrast.py`, not by eye.
2. **Semantic tokens only.** No raw hex in components.
3. **Accent means interactive.** Not clickable, focusable or selected → not accent-colored.
4. **Touch targets ≥44px** on coarse pointers. `min-h-11 sm:min-h-0` keeps desktop compact.
5. **Every animation has a reduced-motion fallback.**
6. **Keyboard first:** visible 2px accent focus rings, logical tab order, Escape closes overlays, skip link before the layout.
7. **No em-dashes in copy.** Restructure with commas, periods or colons.
8. **One head-tag owner** per project.

Rule 1 and rule 7 are the two that get violated most. Check them explicitly before calling UI work done.

## Pick the surface archetype

`design.md` defines three, and they differ in density and rhythm — read the relevant one rather than
averaging them:

- **Reading** — sites, docs, blogs, portfolios.
- **Working** — tools, dashboards, CMS admin.
- **Media / Browse** — streaming, galleries, anything artwork-led.

## Adopting it in a new project

1. Copy `tokens.css` into the project's styles, imported where Tailwind is imported.
2. Install the fonts (`geist` npm package or Fontsource); confirm `--font-sans` / `--font-mono` resolve.
3. Link back to the design repo from the project README so the source of truth stays findable.
4. **When a project needs something the system doesn't cover: decide it once, ship it, then fold the
   decision back into `design.md`.** The system only stays unified if it stays the single place
   decisions land. Raise this explicitly rather than silently inventing a local convention.
