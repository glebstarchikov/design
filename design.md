# Design

The unified design system for everything Gleb Starchikov ships: personal tools, open source projects, CMS admin interfaces, and client websites. It generalizes **Crafted Minimal**, the system built for glebstarchikov.nl, into something any project can adopt in an afternoon.

The lane: near-monochrome, type-led, keyboard-first. Personality comes from motion, interaction craft, and restraint, never from decoration. One electric accent that appears only in interactive moments. Lists over cards. If a page looks quiet at first glance and rewards attention on the second, it is on brand.

## The two layers

Every project uses the same **core** and picks a **theme**.

**Core (never changes per project):**

- The semantic token names and what each one means
- The spacing scale, type scale, and prose measure
- The contrast floor and every other hard rule below
- Motion character: durations, easings, reduced-motion behavior
- Component behavior: focus handling, touch targets, keyboard affordances

**Theme (swappable per client or project):**

- The values behind the color tokens (both light and dark sets)
- Font choices (defaults: Geist Sans and Geist Mono)
- Corner radius values
- Logo and imagery

Your own products, open source, and admin UIs use the default **Gleb theme** defined in this document and in `tokens.css`. A client site gets its own theme file that reassigns the same variables. Nothing else about the system moves.

## Color tokens

Twelve semantic tokens. Components reference tokens, never raw hex. The names describe role, not appearance, so a theme swap never breaks meaning.

### Light (default)

| Token | Hex | Contrast on `bg` | Role |
|---|---|---|---|
| `bg` | `#fcfcfb` | | Body background |
| `elevated` | `#ffffff` | | Panels, inputs, menus, modals |
| `fg` | `#17161a` | 17.5:1 | Primary text |
| `secondary` | `#605f6a` | 6.1:1 | Supporting text |
| `faint` | `#6f6e79` | 4.9:1 | Metadata, labels, placeholders |
| `border` | `#e9e8e4` | | Hairlines |
| `border-strong` | `#dcdbd6` | | Hover borders, kbd chips |
| `accent` | `#4b46f5` | 5.9:1 | Interactive moments only |
| `accent-soft` | `#edecfe` | | Accent halo, selected backgrounds |
| `success` | `#1a7a4d` | 5.2:1 | Positive status, confirmations |
| `warning` | `#96660a` | 4.9:1 | Caution states, pending status |
| `danger` | `#c02f2f` | 5.6:1 | Destructive actions, errors |

### Dark

Derived from the same logic: warm near-black, not pure black; the accent lightened until it clears the floor.

| Token | Hex | Contrast on `bg` | Role |
|---|---|---|---|
| `bg` | `#131215` | | Body background |
| `elevated` | `#1c1b1f` | | Panels, inputs, menus, modals |
| `fg` | `#ececea` | 15.8:1 | Primary text |
| `secondary` | `#a7a6b0` | 7.8:1 | Supporting text |
| `faint` | `#908f99` | 5.8:1 | Metadata, labels, placeholders |
| `border` | `#2a292e` | | Hairlines |
| `border-strong` | `#38373d` | | Hover borders, kbd chips |
| `accent` | `#8a86ff` | 6.2:1 | Interactive moments only |
| `accent-soft` | `#232244` | | Accent halo, selected backgrounds |
| `success` | `#53b483` | 7.3:1 | Positive status, confirmations |
| `warning` | `#d4a72c` | 8.3:1 | Caution states, pending status |
| `danger` | `#ef7066` | 6.4:1 | Destructive actions, errors |

Rules that make the palette work:

- **Accent is for interaction only:** links, focus rings, carets, selection, the primary button, the command prompt glyph. Never for headings, illustrations, or emphasis in prose.
- **Status colors are for status only:** a status dot, a validation message, a destructive button. If a screen shows more than a few at once, the design is shouting; fix the layout, not the palette.
- **Elevation comes from `elevated` + a border,** not from shadows. The one exception is the modal shadow token.
- Dark mode is optional per project. Content sites may ship light-only. Tools and admin UIs should ship both, following system preference via `data-theme`.

## Typography

- **Geist Sans** (`font-sans`): everything by default.
- **Geist Mono** (`font-mono`): the texture of the system. Section labels (11 to 12px uppercase, letter-spacing at most 0.08em), timestamps, kbd hints, table numerics, metadata.
- Display sizes stay modest: 26 to 30px maximum, letter-spacing -0.02em at those sizes. Confidence comes from restraint, not scale.
- Type scale (rem values in `tokens.css`): 12, 14, 16, 18, 20, 26, 30. Body text is 16px on Reading surfaces and 14px on Working surfaces.
- Prose measure caps at ~62ch.
- **Mono-label discipline:** at most one mono uppercase label per view section. Never scaffold every block with one.

## Spacing, radius, borders, shadows

- **Spacing:** 4px base unit. Use the scale (4, 8, 12, 16, 24, 32, 48, 64, 80, 96) and nothing between the steps.
- **Radius:** `radius-sm` 6px for controls (buttons, inputs, chips), `radius-md` 10px for panels and menus, `radius-lg` 14px for modals. Full radius for pills and avatars only.
- **Borders:** 1px hairlines in `border`; `border-strong` on hover or for emphasis. Borders are the primary structural device.
- **Shadows:** one token, `shadow-modal` (`0 16px 40px rgb(0 0 0 / 0.08)`), used by modals and the command menu in light mode. Dark mode relies on `elevated` + borders instead.

## Motion

Engineered, never bouncy.

- **Micro-transitions** (hover, focus, pressed): 150 to 180ms, ease.
- **Reveals** (content entering on scroll or load): 700ms, expo-out (`cubic-bezier(0.16, 1, 0.3, 1)`). Gate reveal styles behind a `js` class on the root element so content is never hidden when JavaScript fails.
- **Panels and modals** (spring, if using a spring library): stiffness 460, damping 34.
- Every animation has a `prefers-reduced-motion` fallback. With framer-motion, wrap in `LazyMotion` (`domAnimation`, `strict`) and `MotionConfig reducedMotion="user"`.
- Nothing bounces, nothing wiggles, nothing autoplays on loop.

## Hard rules

Non-negotiable in every project, every theme. These are the system.

1. **Contrast floor:** no text token below 4.5:1 on `bg` or `elevated`. Verify with math, not eyes: `python3 contrast.py` in this repo. Any decorative-only exception must be listed in the project's own docs.
2. **Semantic tokens only.** No raw hex in components. `tokens.css` resets Tailwind's default palette to enforce this.
3. **Accent means interactive.** If it is not clickable, focusable, or selected, it is not accent-colored.
4. **Touch targets at least 44px** on coarse pointers. The pattern `min-h-11 sm:min-h-0` keeps desktop compact.
5. **Every animation has a reduced-motion fallback.**
6. **Keyboard first:** visible focus rings (2px accent), logical tab order, Escape closes overlays, a skip link before the layout.
7. **No em-dashes in copy.** Restructure with commas, periods, or colons.
8. **One head-tag owner:** exactly one component (or layout) sets document head metadata per project.

## Surfaces

Two density modes. Same tokens, different rhythm.

### Reading (sites, docs, blogs, portfolios)

- Single centered column, `max-w-2xl`, `px-6 sm:px-8`.
- Tall vertical rhythm: 80px (`mt-20`) between major sections.
- Body text 16px, prose measure ~62ch.
- Lists over grids, rows over cards. A work item is a row with a title, a mono timeframe, and an arrow that slides in on hover.

### Working (tools, dashboards, CMS admin)

- Wider layouts and sidebars are allowed. Density is the point.
- Base UI text 14px; table and metadata text may drop to 12px mono.
- Vertical rhythm 16 to 24px between groups, 8 to 12px within them.
- Tables: hairline row dividers only (no vertical rules), `elevated` header row with mono uppercase labels, numeric columns right-aligned in mono, row hover shifts the background one step.
- Admin UIs ship both themes and follow system preference.

### Media / Browse (streaming apps, galleries, anything artwork-led)

Chrome follows the system: nav, buttons, text, dialogs, settings, and player controls use the tokens, one accent, monochrome surfaces, and the motion rules. But the content layer is image-first, poster grids, hero backdrops, episode stills, and that is correct for the medium, not an exception to "lists over cards." The artwork is the interface; the system's restraint lives in the chrome around it. Keep the quiet: one accent, hairline structure, no ambient glows behind the art.

## Core components

Behavioral rules, not a component library. Any implementation that follows these is on-system.

- **Button:** three variants. *Primary*: accent background, `bg`-colored label (this inverts correctly in both themes and clears 4.5:1). *Ghost*: transparent, `fg` label, border appears on hover. *Danger*: danger background, `bg`-colored label, reserved for destructive confirmation, never the default action. Radius `sm`, micro-transition on hover, 44px minimum height on coarse pointers.
- **Input:** `elevated` background, `border` hairline, `border-strong` on hover, 2px accent focus ring, `faint` placeholder. Validation messages in `danger` with the field border matching; never color alone, always a message.
- **List row:** the workhorse. Title in `fg`, meta in mono `faint`, hairline separator, hover shifts background to `elevated`. No cards.
- **kbd chip:** mono, 11 to 12px, `elevated` background, `border-strong` border, radius `sm`. Used for every keyboard affordance.
- **Modal / command menu:** true modal semantics. `role="dialog"`, `aria-modal`, focus trap, body scroll lock, focus restored to trigger on close, Escape steps back through states before closing. `shadow-modal`, radius `lg`. Streaming or live content inside uses `aria-live="polite"`.
- **Empty state:** one sentence in `secondary` plus at most one action. No illustrations by default.
- **Toast / inline status:** prefer inline status near the cause over floating toasts. If a toast is unavoidable: bottom, single line, auto-dismiss, never stacked more than two.

## Theming guide (client projects)

To create a client theme:

1. Copy `tokens.css` into the project.
2. Reassign the twelve color variables in `:root` (and `[data-theme="dark"]` if the project ships dark mode). Keep the semantic names.
3. Optionally swap `--font-sans` / `--font-mono` and the radius values. That is the whole surface area; spacing, motion, and all hard rules stay.
4. Run the contrast check against the new values: update the hex pairs in `contrast.py` and confirm every text token passes 4.5:1 on both `bg` and `elevated`. A theme that fails the floor is not done.
5. Note the theme's origin and date at the top of the copied file, e.g. `/* theme: acme, from glebstar/design v2026-07-06 */`.

The test for a client theme: the client sees their brand; you still recognize the bones.

## Using this in a project

1. Copy `tokens.css` into the project's styles and import it where Tailwind is imported.
2. Install the fonts (`geist` npm package, or Fontsource) and confirm the `--font-sans` / `--font-mono` stacks resolve.
3. Link back to this repo from the project README so future-you knows where the source of truth lives.
4. When a real project needs something this document does not cover, decide it once, ship it, then fold the decision back into this file. The system only stays unified if it stays the single place decisions land.
