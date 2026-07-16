# GitHub Presence Standardization — Design Spec

Date: 2026-07-16
Owner: Gleb Starchikov
Brand source of truth: `~/design` (`design.md`, `tokens.css`) — "Crafted Minimal"

## Goal

Turn `github.com/glebstarchikov` from an empty repo grid into a curated,
on-brand presence, and bring every public repo into one consistent shape:
same presentation, same metadata, same feature toggles, same voice.

North star: the profile should read the way the design system reads. Quiet at
first glance, rewarding on the second. Near-monochrome, type-led, restraint
over decoration. No badge soup, no stat cards, no rainbow shields.

## Scope

**In:**
- A new profile README repo (`glebstarchikov/glebstarchikov`).
- Full standardization of the keeper public repos.
- Making three private repos public (after a history secret scan).
- Archiving three throwaway repos.
- Profile-level metadata (bio, pins).

**Out (this round):**
- `nova-for-b` — stays active and untouched; Gleb builds it out later.
- Keeping private: `glebstarchikov.nl` (live site), `coffee-site` (client),
  `a-hotel` (client, Aseev Hotel Tambov), `tambov-cheese-craft` (client),
  `gustaf`, `gustaf-grand-network`, `gustaf-dashboard`. Client/brand work and
  the live site are not open-sourced now.
- No renames of `Launchpad` (product name) or archived repos.

## Repo inventory and disposition

| Repo | Current | Disposition |
|---|---|---|
| `design` | public, empty README, no license | **Standardize + feature** (keeper) |
| `Launchpad` | public, good README, MIT, topics | **Standardize + feature** (keeper) |
| `codex-check` | public, good README, MIT, topics | **Standardize** (keeper, not featured) |
| `rag-workshop` | public, no README, MIT | **Standardize + feature** (keeper) |
| `rusty-noter` | private, Swift, real app, no README | **Make public → standardize + feature** (flagship) |
| `claude-widget` | private, Swift, has description | **Make public → standardize + feature** |
| `good-eye` | private, TS, has description | **Make public → standardize + feature** |
| `noter` | public, ok README, MIT | **Archive** (superseded by `rusty-noter`) |
| `personal-website` | private, v1 site | **Make public → archive as reference** |
| `nova-for-b` | public, empty | **Leave untouched** (WIP) |
| `pace-pal-for-you` | public, "Trying out Lovable" | **Archive** |
| `craft-your-signature-online` | public, "Trying out Lovable" | **Archive** |
| `UOL-project` | public, no desc/README | **Archive** |
| `glebstarchikov.nl` | private | **Stay private** |
| `coffee-site` | private | **Stay private** (client) |
| `a-hotel` | private | **Stay private** (client) |
| `tambov-cheese-craft` | private | **Stay private** (client) |
| `gustaf` / `-grand-network` / `-dashboard` | private | **Stay private** (brand) |

## 1. Profile README (`glebstarchikov/glebstarchikov`)

The repo does not currently exist. There is only a dead 301 redirect from an
old rename (`glebstarchikov/glebstarchikov` → `personal-website`). Create a new
repo named exactly `glebstarchikov`; its `README.md` renders at the top of the
profile.

### Content (quiet, type-led, lists over cards)

```markdown
<!-- optional theme-aware header, see below -->

# Gleb Starchikov

Founder and solo builder. I design and ship AI-powered apps, developer
tools, and the systems that hold them together, end to end, mostly alone.

Everything shares one lane: near-monochrome, type-led, keyboard-first.
Restraint over decoration.

### Selected work

- **[design](https://github.com/glebstarchikov/design)** — the unified design system behind everything I ship
- **[Launchpad](https://github.com/glebstarchikov/Launchpad)** — self-hosted founder command center · Bun · Hono · React · SQLite
- **[rusty-noter](https://github.com/glebstarchikov/rusty-noter)** — native macOS notes with a local markdown vault, agent-native
- **[claude-widget](https://github.com/glebstarchikov/claude-widget)** — the Claude Code critter, living in your Mac menu bar
- **[good-eye](https://github.com/glebstarchikov/good-eye)** — a searchable design-inspiration database for Claude, via MCP
- **[rag-workshop](https://github.com/glebstarchikov/rag-workshop)** — a notebook that teaches RAG to non-technical people

### Elsewhere

- [glebstarchikov.nl](https://glebstarchikov.nl)
- glebstar06@gmail.com
```

No em-dashes in prose (per brand rule 7); the `·` and list dashes above are
separators, not em-dashes. Keep copy tight.

### Theme-aware SVG header (the one crafted element)

A single header image, the only visual flourish allowed. Rationale: one
crafted element is on-brand; decoration sprinkled everywhere is not.

- Two SVG variants committed to the repo: `header-light.svg`, `header-dark.svg`.
- Rendered with GitHub's supported `<picture>` + `prefers-color-scheme`:

  ```html
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="./header-dark.svg">
    <img alt="Gleb Starchikov" src="./header-light.svg" width="100%">
  </picture>
  ```
- Uses the Gleb theme tokens: `bg`/`fg` for the wordmark, `accent` (`#4b46f5`
  light / `#8a86ff` dark) for a single interactive-feeling detail (a caret, an
  underline, a prompt glyph). Geist type.
- **Type must be outlined to vector paths** in the SVG, because GitHub-hosted
  SVGs cannot load the Geist webfont on the viewer's machine. Outlining
  guarantees identical rendering everywhere.
- Verification: render the README on GitHub in both light and dark mode and
  confirm the correct variant shows and type is crisp. Provide a PNG fallback
  only if SVG rendering misbehaves.

### Profile metadata

- **Bio:** `Founder and solo builder. AI apps, dev tools, and the systems around them.`
- **Pinned repos (6):** design, Launchpad, rusty-noter, claude-widget, good-eye, rag-workshop. (`codex-check` deliberately not pinned; old `noter` archived.)
- **Location:** `Netherlands`.
- Blog link already set to `glebstarchikov.nl`.

## 2. Repo README template (keepers)

One shared skeleton so all keeper repos read as a family. Scale sections to the
repo; omit "Getting started" for non-runnable repos (e.g. `rag-workshop`,
`design`).

```markdown
# <name>

<one-line: what it is, for whom>

<1–2 sentence paragraph: the problem it solves / why it exists>

<!-- if it has a live demo -->
**Live:** <url>

## Stack
<compact list or single line>

## Getting started      <!-- runnable repos only -->
```sh
<install + run>
```

## License
MIT

---
Part of what I build at [glebstarchikov.nl](https://glebstarchikov.nl).
```

The trailing footer line is identical across every keeper repo — it is the
signature that ties the family together.

## 3. Consistency baseline ("same things turned on")

Applied identically to all 7 keeper repos: `design`, `Launchpad`,
`codex-check`, `rag-workshop` (existing public) + `claude-widget`, `good-eye`,
`rusty-noter` (newly public). Old `noter` is archived, not standardized.

| Dimension | Standard |
|---|---|
| **Description** | One clean sentence. No "trying out X" filler. |
| **Topics** | Consistent taxonomy: relevant tech tags + one category tag (e.g. `dev-tools`, `ai`, `design-system`, `mcp-server`). |
| **License** | MIT on all. `design` currently has none — add it. |
| **Homepage** | Live demo URL where one exists, else `https://glebstarchikov.nl`. |
| **Features** | Issues **on**; Wiki, Projects, Discussions **off** unless actively used. |
| **Security** | Dependabot alerts **on**. |
| **Social preview** | One on-brand OG image template (Crafted Minimal wordmark + repo name), generated per repo and set as the repo social preview. In the main pass. |
| **Default branch** | `main` everywhere. |

## 4. Make-public procedure (gated)

Applies to `claude-widget`, `good-eye`, `personal-website`, `rusty-noter`.
Publishing is effectively irreversible (clone/cache/index), so the gate is
mandatory. `rusty-noter` is a Swift app in active development, scan its history
for signing secrets and API keys in particular.

For each repo, in order:

1. **History secret scan** over all commits, not just the working tree
   (`gitleaks detect` and/or `trufflehog git file://<path>`). Also grep history
   for `.env`, keys, tokens, service-role secrets.
2. **If history is clean:** proceed to flip public.
3. **If history is dirty:** do NOT flip. Preferred remediation is a fresh repo
   published from a clean current tree without the poisoned history (squash /
   new-init), not history rewriting-and-praying. Rotate any exposed secret
   regardless.
4. After flip: apply the §2 README template and §3 baseline.

Special case `personal-website` (v1): after publishing, apply an honest
archived-reference README (v1, retired, superseded by the live Astro site at
glebstarchikov.nl) and **archive** it (read-only).

## 5. Archive procedure

Applies to `pace-pal-for-you`, `craft-your-signature-online`, `UOL-project`,
and `noter`:

1. Replace README with a single honest line (e.g. "Early experiment.
   Archived."), cross-linking a successor where one exists.
2. Archive the repo (public, read-only). They stop cluttering the active grid.

No full template, no metadata polish — archived repos are not showcases.

`noter` is a special case: it is a real predecessor, not a throwaway. Keep its
existing README, repoint its **description** at `rusty-noter` as the successor
("Previous web version. Succeeded by rusty-noter."), then archive.

## 6. Execution order

1. Secret-scan the 4 make-public candidates (fail fast before any public change).
2. Create the profile repo + README + header; set bio, location, pins.
3. Flip the clean private repos public.
4. Apply README template + baseline to all 7 keepers.
5. Archive-note + archive the 3 throwaways.
6. Archive `personal-website` (reference README) and `noter` (repointed description).

Batch the mechanical `gh` metadata operations (topics, license, homepage,
feature toggles, Dependabot) so they run consistently across repos.

## 7. Risks and open items

- **Secrets in history** is the top risk — the §4 gate exists for it. `good-eye`
  is an MCP tool that may hold API keys or scraped data in history; scan hard.
- **SVG font rendering** on GitHub — mitigated by outlining type to paths;
  verify by eye in both themes.
- **Social preview images** need a small generator or template (SVG → 1280×640
  PNG, set via GitHub's social-preview upload). In the main pass; the generator
  is the one net-new build here, so budget for it.

## 8. Verification

- Profile README renders correctly in GitHub light + dark; correct SVG variant
  per theme; all 6 pins set.
- Each keeper repo: description set, topics present, MIT license file, homepage
  set, Issues-only features, Dependabot on, README follows template with the
  shared footer.
- `gh repo view <repo> --json ...` spot-check confirms metadata parity across
  keepers.
- The 4 newly public repos (`claude-widget`, `good-eye`, `rusty-noter`,
  `personal-website`) are public and passed the secret gate; the 3 throwaways,
  `personal-website`, and old `noter` show as archived.
