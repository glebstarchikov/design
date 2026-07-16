# GitHub Presence Standardization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn `github.com/glebstarchikov` into a curated, on-brand presence and bring every public repo into one consistent shape (presentation, metadata, feature toggles, voice).

**Architecture:** Mostly `gh` CLI operations (repo metadata, visibility, features, pins) plus one net-new build: a Bun + Playwright brand-asset generator that renders on-brand PNGs (profile header light/dark, per-repo social previews) from the `~/design` tokens. A history secret-scan gate runs before any repo is made public.

**Tech Stack:** `gh` CLI, `git`, `gitleaks`/`trufflehog` (secret scan), Bun, Playwright (HTML→PNG rendering), the `~/design` design system (`design.md`, `tokens.css`, Geist fonts).

## Global Constraints

- Brand: near-monochrome, type-led, restraint over decoration. No badge soup, no stat cards, no shields.
- Accent color: `#4b46f5` (light) / `#8a86ff` (dark). Accent = interactive moments only.
- Fonts: Geist Sans / Geist Mono.
- **No em-dashes** in any copy. Restructure with commas, periods, colons.
- License on all keepers: MIT.
- Default branch everywhere: `main`.
- Keeper repos (full README + metadata baseline, 7): `design`, `Launchpad`, `codex-check`, `rag-workshop`, `claude-widget`, `good-eye`, `rusty-noter` (the last three after they go public). `codex-check` is a polished keeper but NOT featured.
- `personal-website` (v1): publish → reference README → archive.
- Archive: `pace-pal-for-you`, `craft-your-signature-online`, `UOL-project`, and `noter` (superseded by `rusty-noter`; repoint its description, keep its README).
- Untouched: `nova-for-b`. Stay private: `glebstarchikov.nl`, `coffee-site`, `a-hotel`, `tambov-cheese-craft`, `gustaf`, `gustaf-grand-network`, `gustaf-dashboard`.
- Pins (6): `design`, `Launchpad`, `rusty-noter`, `claude-widget`, `good-eye`, `rag-workshop`.
- Owner/handle: `glebstarchikov`. Email: `glebstar06@gmail.com`. Site: `https://glebstarchikov.nl`.
- **Publishing is irreversible.** No repo goes public until its full git history passes the secret scan (Task 1).

## File / asset map

- Generator lives in `~/design/scripts/brand-assets/`:
  - `generate.ts` — CLI: renders header + social-preview PNGs from an HTML template.
  - `template-header.html` — profile header (light + dark via a `?theme=` query).
  - `template-social.html` — 1280×640 social preview (repo name + tagline).
  - `out/` — generated PNGs (git-ignored; uploaded to repos, not committed to `~/design`).
- Profile repo `glebstarchikov/glebstarchikov` (new): `README.md`, `header-light.png`, `header-dark.png`.
- Each keeper repo: `README.md` (+ `LICENSE` where missing). Social preview set via GitHub upload (not a committed file).

---

### Task 1: Secret-scan gate for the make-public candidates

**Repos:** `claude-widget`, `good-eye`, `personal-website`, `rusty-noter`. Nothing goes public until this passes. `rusty-noter` is an actively-developed Swift app; scan especially for signing secrets and API keys.

**Files:**
- Local clones under a scratch dir, e.g. `/private/tmp/claude-501/.../scratchpad/scan/`.

**Interfaces:**
- Produces: a clean/dirty verdict per repo. "Clean" is the precondition for Task 4.

- [ ] **Step 1: Ensure a scanner is available**

Run: `gitleaks version || brew install gitleaks`
Expected: a version string.

- [ ] **Step 2: Clone each candidate with full history**

```bash
mkdir -p "$SCAN" && cd "$SCAN"
for r in claude-widget good-eye personal-website rusty-noter; do
  gh repo clone glebstarchikov/$r -- --no-single-branch
done
```
Expected: three clones, each with full `.git` history.

- [ ] **Step 3: Scan full history of each repo**

```bash
for r in claude-widget good-eye personal-website rusty-noter; do
  echo "=== $r ==="; gitleaks detect --source "$SCAN/$r" --no-banner --redact -v || true
done
```
Also grep history for stray env files:
```bash
for r in claude-widget good-eye personal-website rusty-noter; do
  git -C "$SCAN/$r" log --all --name-only --pretty=format: | sort -u | grep -Ei '\.env|secret|credential|\.pem|serviceRole' || echo "$r: no suspicious paths"
done
```
Expected: zero leaks per repo.

- [ ] **Step 4: Record verdicts**

For each repo write `CLEAN` or `DIRTY: <finding>`.
- **If CLEAN:** it is eligible for Task 4.
- **If DIRTY:** do NOT make it public in Task 4. Remediation (out of this plan's happy path): rotate the exposed secret immediately, then publish a fresh repo from a clean current tree (`git init` on the working files, no old history) instead of the original. Flag to Gleb before proceeding.

- [ ] **Step 5: Commit the verdict note**

```bash
# in ~/design
mkdir -p docs/superpowers/notes
$EDITOR docs/superpowers/notes/2026-07-16-secret-scan-verdicts.md   # record CLEAN/DIRTY per repo
git add docs/superpowers/notes/2026-07-16-secret-scan-verdicts.md
git commit -m "chore: record secret-scan verdicts for make-public candidates"
```

---

### Task 2: Brand-asset generator (Bun + Playwright)

**Files:**
- Create: `~/design/scripts/brand-assets/generate.ts`
- Create: `~/design/scripts/brand-assets/template-header.html`
- Create: `~/design/scripts/brand-assets/template-social.html`
- Create: `~/design/scripts/brand-assets/.gitignore` (ignore `out/`)

**Interfaces:**
- Produces:
  - `generate.ts header` → `out/header-light.png`, `out/header-dark.png` (1600×400, 2× for retina, displayed at 100% width).
  - `generate.ts social --name <repo> --tagline "<one-line>"` → `out/social-<repo>.png` (1280×640).
- Rationale for PNG over SVG: GitHub `<picture>` + `prefers-color-scheme` works with PNG `srcset`, and rendering HTML with the real Geist webfont via Playwright guarantees exact type without the SVG font-outlining fragility the spec flagged. This is the spec's sanctioned "PNG fallback", chosen up front for reliability.

- [ ] **Step 1: Scaffold and install**

```bash
mkdir -p ~/design/scripts/brand-assets/out
cd ~/design/scripts/brand-assets
printf 'out/\nnode_modules/\n' > .gitignore
bun add -d playwright @playwright/test
bunx playwright install chromium
```
Expected: chromium installed.

- [ ] **Step 2: Write the header template**

`template-header.html` renders the wordmark on brand tokens. Read the exact token hex from `~/design/tokens.css`; inline them so the file is self-contained. Load Geist from `@fontsource` woff2 files (install `bun add @fontsource/geist-sans @fontsource/geist-mono` and reference the local paths via `file://`, or embed as base64 to avoid path issues). Body is 1600×400, transparent-free (`bg` token fills it). A single accent glyph (e.g. a `▍` caret in `accent`) is the only accent use.

```html
<!doctype html><html data-theme="light"><head><style>
  @font-face{font-family:Geist;src:url('<file-or-base64>') format('woff2');}
  :root{--bg:#fcfcfb;--fg:#17161a;--accent:#4b46f5;}
  html[data-theme=dark]{--bg:#131215;--fg:#ececea;--accent:#8a86ff;}
  html,body{margin:0} body{width:1600px;height:400px;background:var(--bg);
    display:flex;align-items:center;padding:0 96px;box-sizing:border-box;
    font-family:Geist;color:var(--fg)}
  .name{font-size:96px;letter-spacing:-0.02em;font-weight:600}
  .caret{color:var(--accent);margin-left:8px}
</style></head><body>
  <div class="name">Gleb Starchikov<span class="caret">▍</span></div>
</body></html>
```

- [ ] **Step 3: Write the social template**

`template-social.html`: 1280×640, same tokens/font. Repo name (mono label small, `faint`) + tagline (sans, `fg`) + a hairline `border` rule. Placeholders `__NAME__` and `__TAGLINE__` replaced by the generator.

```html
<!doctype html><html data-theme="light"><head><style>
  /* same @font-face + token vars as header */
  body{width:1280px;height:640px;background:var(--bg);color:var(--fg);
    font-family:Geist;display:flex;flex-direction:column;justify-content:center;
    padding:0 100px;box-sizing:border-box;margin:0}
  .kicker{font-family:'Geist Mono';font-size:22px;letter-spacing:0.08em;
    text-transform:uppercase;color:#6f6e79;margin-bottom:24px}
  .title{font-size:76px;letter-spacing:-0.02em;line-height:1.05;font-weight:600}
  .rule{height:1px;background:#e9e8e4;margin-top:40px;width:180px}
</style></head><body>
  <div class="kicker">glebstarchikov</div>
  <div class="title">__NAME__</div>
  <div class="rule"></div>
  <div style="margin-top:28px;font-size:30px;color:#605f6a">__TAGLINE__</div>
</body></html>
```

- [ ] **Step 4: Write `generate.ts`**

```ts
import { chromium } from "playwright";
import { readFileSync } from "node:fs";

const [, , mode, ...rest] = process.argv;
const argOf = (k: string) => { const i = rest.indexOf(`--${k}`); return i >= 0 ? rest[i + 1] : undefined; };

const browser = await chromium.launch();
const shoot = async (html: string, w: number, h: number, out: string) => {
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: mode === "header" ? 1 : 1 });
  await page.setContent(html, { waitUntil: "networkidle" });
  await page.evaluate(() => (document as any).fonts.ready);
  await page.screenshot({ path: out });
  await page.close();
};

if (mode === "header") {
  const tpl = readFileSync(new URL("./template-header.html", import.meta.url), "utf8");
  await shoot(tpl.replace('data-theme="light"', 'data-theme="light"'), 1600, 400, "out/header-light.png");
  await shoot(tpl.replace('data-theme="light"', 'data-theme="dark"'), 1600, 400, "out/header-dark.png");
} else if (mode === "social") {
  const name = argOf("name")!, tagline = argOf("tagline")!;
  const tpl = readFileSync(new URL("./template-social.html", import.meta.url), "utf8")
    .replace("__NAME__", name).replace("__TAGLINE__", tagline);
  await shoot(tpl, 1280, 640, `out/social-${name}.png`);
}
await browser.close();
```

- [ ] **Step 5: Generate the header and eyeball it**

Run: `cd ~/design/scripts/brand-assets && bun generate.ts header`
Expected: `out/header-light.png` and `out/header-dark.png` exist; open both, confirm Geist renders, accent caret is the only color, dark variant uses dark tokens.

- [ ] **Step 6: Generate one social preview as a smoke test**

Run: `bun generate.ts social --name codex-check --tagline "Second-opinion code review for Claude Code"`
Expected: `out/social-codex-check.png` is 1280×640, on brand.

- [ ] **Step 7: Commit the generator (not the PNGs)**

```bash
cd ~/design
git add scripts/brand-assets/generate.ts scripts/brand-assets/template-*.html scripts/brand-assets/.gitignore
git commit -m "feat: brand-asset generator for profile header and repo social previews"
```

---

### Task 3: Create the profile repo, README, header, and profile metadata

**Files:**
- New repo `glebstarchikov/glebstarchikov`: `README.md`, `header-light.png`, `header-dark.png`.

**Interfaces:**
- Consumes: `out/header-light.png`, `out/header-dark.png` from Task 2.

- [ ] **Step 1: Create the repo**

```bash
gh repo create glebstarchikov/glebstarchikov --public --description "Profile README" --clone
cd glebstarchikov
cp ~/design/scripts/brand-assets/out/header-light.png header-light.png
cp ~/design/scripts/brand-assets/out/header-dark.png header-dark.png
```

- [ ] **Step 2: Write `README.md`**

```markdown
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="./header-dark.png">
  <img alt="Gleb Starchikov" src="./header-light.png" width="100%">
</picture>

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

- [ ] **Step 3: Commit and push**

```bash
git add README.md header-light.png header-dark.png
git commit -m "feat: on-brand profile README with theme-aware header"
git push
```

- [ ] **Step 4: Verify render in both themes**

Open `https://github.com/glebstarchikov` in light and dark mode.
Expected: correct header per theme, links resolve, no broken images. (Note: `claude-widget`/`good-eye` links 404 until Task 4 publishes them; acceptable to land Task 4 first if preferred, but the profile can ship now since links go live once repos flip.)

- [ ] **Step 5: Set bio and location**

```bash
gh api -X PATCH /user -f bio="Founder and solo builder. AI apps, dev tools, and the systems around them." -f location="Netherlands"
gh api /user --jq '{bio,location}'
```
Expected: bio and `Netherlands` echoed back.

- [ ] **Step 6: Set the 6 pins**

Pinning is not in `gh` core; use the GraphQL mutation. First get repo node IDs, then pin.
```bash
for r in design Launchpad rusty-noter claude-widget good-eye rag-workshop; do
  gh api repos/glebstarchikov/$r --jq '.node_id'; done   # collect IDs (newly-public repos must be public first)
```
Then:
```bash
gh api graphql -f query='mutation($ids:[ID!]!){ updatePinnedItems(input:{items:$ids}){ clientMutationId } }' \
  -f ids='<id1>' -f ids='<id2>' ...   # pass all 6 node IDs
```
Expected: profile shows exactly those 6 pinned. (Run this step after Task 4 so all 6 are public.)

---

### Task 4: Make the clean private repos public

**Repos:** `claude-widget`, `good-eye`, `personal-website` — only those marked CLEAN in Task 1.

- [ ] **Step 1: Flip each CLEAN repo to public**

```bash
for r in claude-widget good-eye personal-website rusty-noter; do
  gh repo edit glebstarchikov/$r --visibility public --accept-visibility-change-consequences
done
```
Expected: no error; each now public.

- [ ] **Step 2: Verify**

```bash
for r in claude-widget good-eye personal-website rusty-noter; do
  gh repo view glebstarchikov/$r --json isPrivate --jq '"\(.name // "'"$r"'") private=\(.isPrivate)"'; done
```
Expected: `private=false` for each. If any was DIRTY in Task 1, it is absent here — do not flip it.

---

### Task 5: README + metadata baseline for each keeper

Applies to all 7 keepers: `design`, `Launchpad`, `codex-check`, `rag-workshop`, `claude-widget`, `good-eye`, `rusty-noter`. (`personal-website` gets the *reference* variant and old `noter` gets archived, both in Task 7.)

**Interfaces:**
- Consumes: repos public (Task 4). Produces: consistent README + metadata per repo.

Per repo, repeat Steps 1–5. README bodies for repos with existing good content (`Launchpad`, `codex-check`) only need the shared footer + metadata added; for the rest, author from the template by reading the repo.

- [ ] **Step 1: Read the repo to source accurate README content**

```bash
gh repo clone glebstarchikov/<repo> -- --depth 1 2>/dev/null; cd <repo>
cat package.json 2>/dev/null; ls   # derive stack + run commands
```
For `design`: content-only (no run section). For `rag-workshop`: notebook, no run section, note MIT + audience. For `claude-widget`: Swift/macOS, build via Xcode. For `good-eye`: TS MCP server, note how to run the MCP. For `rusty-noter`: native macOS app (Swift, XcodeGen `project.yml`), local markdown vault, agent-native; build via `xcodegen` + Xcode. This is the flagship, give it the strongest README of the set.

- [ ] **Step 2: Write `README.md` from the shared template**

Template (fill per repo; omit "Getting started" for non-runnable repos):
```markdown
# <name>

<one-line: what it is, for whom>

<1–2 sentences: the problem it solves / why it exists>

**Live:** <url>            <!-- only if a live demo exists -->

## Stack
<compact single line or short list>

## Getting started         <!-- runnable repos only -->
```sh
<install + run>
```

## License
MIT

---
Part of what I build at [glebstarchikov.nl](https://glebstarchikov.nl).
```
The trailing footer line is byte-identical across every keeper.

- [ ] **Step 3: Add MIT LICENSE where missing**

`design`, `claude-widget`, `good-eye`, `rusty-noter` need a license file if absent.
```bash
test -f LICENSE || gh api /licenses/mit --jq '.body' \
  | sed "s/\[year\]/2026/; s/\[fullname\]/Gleb Starchikov/" > LICENSE
```
Expected: `LICENSE` present with MIT text.

- [ ] **Step 4: Commit and push README + LICENSE**

```bash
git add README.md LICENSE
git commit -m "docs: on-brand README + MIT license"
git push
```

- [ ] **Step 5: Apply the metadata baseline via `gh`**

```bash
gh repo edit glebstarchikov/<repo> \
  --description "<clean one sentence>" \
  --homepage "<live-url-or-https://glebstarchikov.nl>" \
  --add-topic "<tech1>" --add-topic "<tech2>" --add-topic "<category>" \
  --enable-issues --enable-wiki=false --enable-projects=false
```
Suggested topics per repo (tech + one category):
- `design`: `design-system`, `css`, `design-tokens`
- `Launchpad`: keep existing (already good)
- `codex-check`: keep existing (already good)
- `rag-workshop`: `rag`, `jupyter`, `education`
- `claude-widget`: `swift`, `macos`, `claude-code`
- `good-eye`: `mcp-server`, `typescript`, `design`
- `rusty-noter`: `swift`, `macos`, `ai`, `notes`

- [ ] **Step 6: Enable Dependabot alerts**

```bash
gh api -X PUT repos/glebstarchikov/<repo>/vulnerability-alerts
```
Expected: 204 No Content.

- [ ] **Step 7: Verify metadata parity**

```bash
gh repo view glebstarchikov/<repo> --json name,description,homepageUrl,licenseInfo,repositoryTopics,hasIssuesEnabled,hasWikiEnabled \
  --jq '{name,description,homepageUrl,license:.licenseInfo.key,topics:[.repositoryTopics[].name],issues:.hasIssuesEnabled,wiki:.hasWikiEnabled}'
```
Expected: description non-empty, homepage set, `license:"mit"`, topics present, `issues:true`, `wiki:false`.

---

### Task 6: Generate and set social previews for keepers

**Interfaces:**
- Consumes: the generator (Task 2), the keeper list.

- [ ] **Step 1: Generate a social preview per keeper**

```bash
cd ~/design/scripts/brand-assets
bun generate.ts social --name design --tagline "The unified design system for everything I ship"
bun generate.ts social --name Launchpad --tagline "Self-hosted founder command center"
bun generate.ts social --name codex-check --tagline "Second-opinion code review for Claude Code"
bun generate.ts social --name rusty-noter --tagline "Native macOS notes, local markdown vault, agent-native"
bun generate.ts social --name rag-workshop --tagline "Teach RAG to non-technical people"
bun generate.ts social --name claude-widget --tagline "The Claude Code critter in your menu bar"
bun generate.ts social --name good-eye --tagline "A design-inspiration database for Claude, via MCP"
```
Expected: seven `out/social-*.png`.

- [ ] **Step 2: Upload each as the repo social preview**

GitHub has no REST endpoint for social preview upload; it is a web-UI action (Settings → Social preview → Upload). For each repo, open Settings and upload the matching `out/social-<repo>.png`.
```bash
for r in design Launchpad codex-check rusty-noter rag-workshop claude-widget good-eye; do
  echo "Upload out/social-$r.png at: https://github.com/glebstarchikov/$r/settings"; done
```
Expected: each repo's social card shows the on-brand image (verify by pasting a repo URL into a preview, or reload Settings).

---

### Task 7: Archive `personal-website`, `noter`, and the throwaways

- [ ] **Step 1: Reference README for `personal-website`**

```bash
gh repo clone glebstarchikov/personal-website -- --depth 1; cd personal-website
```
Write `README.md`:
```markdown
# personal-website — v1 (archived)

The first version of glebstarchikov.nl. React + Vite + Supabase, with a
custom CMS. Retired and kept as a reference. The live site is now a separate
Astro build.

Live: [glebstarchikov.nl](https://glebstarchikov.nl)

## License
MIT
```
```bash
test -f LICENSE || gh api /licenses/mit --jq '.body' | sed "s/\[year\]/2026/; s/\[fullname\]/Gleb Starchikov/" > LICENSE
git add README.md LICENSE && git commit -m "docs: archive v1 as reference" && git push
gh repo edit glebstarchikov/personal-website --description "v1 of glebstarchikov.nl (archived reference). React + Vite + Supabase + custom CMS." --homepage "https://glebstarchikov.nl"
gh repo archive glebstarchikov/personal-website --yes
```
Expected: repo shows the archived banner.

- [ ] **Step 2: Honest one-liner + archive the throwaways**

For each of `pace-pal-for-you`, `craft-your-signature-online`, `UOL-project`:
```bash
gh repo clone glebstarchikov/<repo> -- --depth 1; cd <repo>
printf '# %s\n\nEarly experiment. Archived.\n' "<repo>" > README.md
git add README.md && git commit -m "docs: mark as archived experiment" && git push
gh repo archive glebstarchikov/<repo> --yes
```
(For `pace-pal-for-you` and `craft-your-signature-online`, which have live Lovable URLs, keep the existing homepage; optionally add "Built with Lovable." to the line.)
Expected: all three archived.

- [ ] **Step 3: Repoint and archive old `noter`**

`noter` is a real predecessor, not a throwaway. Keep its existing README, just repoint its description at the successor and archive.
```bash
gh repo edit glebstarchikov/noter --description "Previous web version of noter (Next.js + Supabase + Deepgram). Succeeded by rusty-noter, the native macOS app." --homepage "https://github.com/glebstarchikov/rusty-noter"
gh repo archive glebstarchikov/noter --yes
```
Expected: `noter` archived, description points at `rusty-noter`.

- [ ] **Step 4: Verify archive state**

```bash
for r in personal-website noter pace-pal-for-you craft-your-signature-online UOL-project; do
  gh repo view glebstarchikov/$r --json isArchived --jq '"'"$r"' archived=\(.isArchived)"'; done
```
Expected: `archived=true` for all five.

---

### Task 8: Final verification sweep

- [ ] **Step 1: Profile-level checks**

```bash
gh api /user --jq '{bio,location,blog}'
```
Expected: bio set, `Netherlands`, blog `https://glebstarchikov.nl`. Manually confirm 6 pins render and the header switches with theme.

- [ ] **Step 2: Keeper parity table**

```bash
for r in design Launchpad codex-check rusty-noter rag-workshop claude-widget good-eye; do
  gh repo view glebstarchikov/$r --json name,description,homepageUrl,licenseInfo,repositoryTopics,hasIssuesEnabled,hasWikiEnabled \
    --jq '"\(.name)\tdesc:\(.description|length>0)\thome:\(.homepageUrl|length>0)\tlic:\(.licenseInfo.key)\ttopics:\(.repositoryTopics|length)\tissues:\(.hasIssuesEnabled)\twiki:\(.hasWikiEnabled)"'
done
```
Expected: every row shows `desc:true home:true lic:mit topics:>=1 issues:true wiki:false`.

- [ ] **Step 3: Visibility + archive final state**

```bash
gh repo list glebstarchikov --limit 100 --json name,isPrivate,isArchived \
  --jq 'sort_by(.name)[] | "\(.name)\tprivate=\(.isPrivate)\tarchived=\(.isArchived)"'
```
Expected: `claude-widget`/`good-eye`/`personal-website`/`rusty-noter` public; `personal-website` + `noter` + the 3 throwaways archived; the 7 stay-private repos (`glebstarchikov.nl`, `coffee-site`, `a-hotel`, `tambov-cheese-craft`, `gustaf`, `gustaf-grand-network`, `gustaf-dashboard`) still `private=true`; `nova-for-b` untouched.

- [ ] **Step 4: Confirm no secrets went public**

Re-run `gitleaks detect` against the now-public `claude-widget`, `good-eye`, `personal-website`, `rusty-noter` one final time.
Expected: zero leaks (belt-and-suspenders after the Task 1 gate).

---

## Self-Review

**Spec coverage:** Profile README + header (Task 3), bio/location/pins (Task 3), keeper README template + metadata baseline + Dependabot + features (Task 5), social previews (Tasks 2, 6), make-public gate incl. `rusty-noter` (Task 1) + flip (Task 4), archive of throwaways + `personal-website` reference + old `noter` repointed at `rusty-noter` (Task 7), verification (Task 8). All spec sections covered.

**Placeholder scan:** README bodies for `design`, `rag-workshop`, `claude-widget`, `good-eye`, `rusty-noter` are authored at execution time from the repo (Task 5 Step 1–2) because their accurate stack/run details require reading each repo; the template and a per-repo topic/tagline are concrete, so this is a sourcing step, not a vague placeholder. `rusty-noter` gets the strongest README as the flagship. Everything else is verbatim.

**Type/naming consistency:** Keeper list, pin list, topic slugs, and the byte-identical footer line are consistent across Tasks 3, 5, 6, 8. Generator output filenames (`out/header-*.png`, `out/social-<name>.png`) match their consumers in Tasks 3 and 6.
