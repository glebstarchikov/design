#!/usr/bin/env bun
/**
 * Brand-asset generator for Gleb Starchikov's GitHub presence.
 *
 * Renders on-brand PNGs from the "Crafted Minimal" design system
 * (~/design/tokens.css, ~/design/design.md) using headless Chromium
 * via Playwright. Geist Sans / Geist Mono are embedded as base64
 * data: URIs so rendering never depends on network access.
 *
 * Usage:
 *   bun generate.ts header
 *     -> out/header-light.png, out/header-dark.png (1600x400)
 *   bun generate.ts social --name <repo> --tagline "<one line>"
 *     -> out/social-<repo>.png (1280x640)
 */

import { chromium } from "playwright";
import { readFileSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";

const ROOT = import.meta.dir;
const FONT_DIR = resolve(ROOT, "node_modules/geist/dist/fonts");
const OUT_DIR = resolve(ROOT, "out");

// ---- Design tokens (source of truth: ~/design/tokens.css) ----

const TOKENS = {
  light: {
    bg: "#fcfcfb",
    fg: "#17161a",
    secondary: "#605f6a",
    faint: "#6f6e79",
    border: "#e9e8e4",
    accent: "#4b46f5",
  },
  dark: {
    bg: "#131215",
    fg: "#ececea",
    secondary: "#a7a6b0",
    faint: "#908f99",
    border: "#2a292e",
    accent: "#8a86ff",
  },
} as const;

type Theme = keyof typeof TOKENS;

function tokenVars(theme: Theme): string {
  const t = TOKENS[theme];
  return `--bg:${t.bg};--fg:${t.fg};--secondary:${t.secondary};--faint:${t.faint};--border:${t.border};--accent:${t.accent};`;
}

// ---- Fonts: embed Geist Sans / Geist Mono as base64 data: URIs ----

function b64(relPath: string): string {
  return readFileSync(resolve(FONT_DIR, relPath)).toString("base64");
}

function fontFace(family: string, weight: number, relPath: string): string {
  const data = b64(relPath);
  return `@font-face {
    font-family: "${family}";
    font-style: normal;
    font-weight: ${weight};
    font-display: block;
    src: url(data:font/woff2;base64,${data}) format("woff2");
  }`;
}

const FONT_FACES = [
  fontFace("Geist Sans", 400, "geist-sans/Geist-Regular.woff2"),
  fontFace("Geist Sans", 500, "geist-sans/Geist-Medium.woff2"),
  fontFace("Geist Sans", 600, "geist-sans/Geist-SemiBold.woff2"),
  fontFace("Geist Mono", 400, "geist-mono/GeistMono-Regular.woff2"),
  fontFace("Geist Mono", 500, "geist-mono/GeistMono-Medium.woff2"),
].join("\n");

// ---- Rendering ----

function loadTemplate(name: string): string {
  return readFileSync(resolve(ROOT, name), "utf-8");
}

async function render(
  html: string,
  width: number,
  height: number,
  outPath: string,
  fontChecks: string[],
): Promise<void> {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({
      viewport: { width, height },
      deviceScaleFactor: 1,
    });
    await page.setContent(html, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);

    // Confirm Geist actually loaded (not a serif/sans fallback). Only the
    // fonts actually used on this page are checked, since a browser will
    // never activate a @font-face that no visible text requests.
    for (const check of fontChecks) {
      const loaded = await page.evaluate((c) => document.fonts.check(c), check);
      if (!loaded) {
        throw new Error(
          `Font verification failed for "${check}". Geist did not load; ` +
            `refusing to write a fallback-font PNG.`,
        );
      }
    }

    mkdirSync(dirname(outPath), { recursive: true });
    await page.screenshot({ path: outPath });
  } finally {
    await browser.close();
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ---- Commands ----

async function cmdHeader(): Promise<void> {
  const template = loadTemplate("template-header.html");
  for (const theme of ["light", "dark"] as Theme[]) {
    const html = template
      .replace("__FONT_FACES__", FONT_FACES)
      .replace("__THEME__", theme)
      .replace("__TOKEN_VARS__", tokenVars(theme));
    const outPath = resolve(OUT_DIR, `header-${theme}.png`);
    await render(html, 1600, 400, outPath, ['600 72px "Geist Sans"']);
    console.log(`wrote ${outPath}`);
  }
}

async function cmdSocial(args: string[]): Promise<void> {
  let name = "";
  let tagline = "";
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--name") name = args[++i] ?? "";
    if (args[i] === "--tagline") tagline = args[++i] ?? "";
  }
  if (!name) throw new Error('social requires --name <repo>');
  if (!tagline) throw new Error('social requires --tagline "<one line>"');

  const template = loadTemplate("template-social.html");
  const html = template
    .replace("__FONT_FACES__", FONT_FACES)
    .replace("__TOKEN_VARS__", tokenVars("light"))
    .replace("__NAME__", escapeHtml(name))
    .replace("__TAGLINE__", escapeHtml(tagline));

  const outPath = resolve(OUT_DIR, `social-${name}.png`);
  await render(html, 1280, 640, outPath, [
    '600 64px "Geist Sans"',
    '500 14px "Geist Mono"',
  ]);
  console.log(`wrote ${outPath}`);
}

async function main(): Promise<void> {
  const [, , cmd, ...rest] = process.argv;
  if (cmd === "header") {
    await cmdHeader();
  } else if (cmd === "social") {
    await cmdSocial(rest);
  } else {
    console.error(
      'Usage:\n' +
        '  bun generate.ts header\n' +
        '  bun generate.ts social --name <repo> --tagline "<one line>"',
    );
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
