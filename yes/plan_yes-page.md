# Plan: "yes" page (AI contributions welcome)

Status: completed

## Context

Developers want a link they can drop in a README that says "this repo takes AI-assisted contributions, and some of the code here was made with AI." The `yes/` directory is empty. The `no/` sibling exists but this page is standalone (user choice). Output is one fast, accessible HTML page plus a README badge.

## Goal

Ship `yes/dist/index.html` (single file, inline CSS, no JS, no web fonts) and `yes/dist/badge.svg`, under 6 KB combined uncompressed, passing WCAG 2.2 AA checks in both light and dark modes.

## Assumptions and open points to challenge

- "Welcomes AI" can be read as "welcomes low-effort PRs." The copy should say the human submitting still owns the code. This protects maintainers who link the page.
- "Loads very quickly" is taken to mean: one HTML request, no render-blocking assets, no third-party requests. The badge is only fetched by READMEs, not by the page itself (the page shows it inline as SVG markup or via `<img>` loaded lazily; inline is preferred to keep one request).
- No analytics, no cookies. Adding either later would break the "lean" goal.

## Design

- Layout: one centered column, `max-width: 38rem`, `1rem` side gutter, generous line height (1.6). Works at 320px with no horizontal scroll.
- Type: system font stack for body, `ui-monospace` stack for the badge snippet. Body size `1.125rem`, rem units throughout so user zoom/text scaling works to 200%.
- Color tokens on `:root`, swapped under `@media (prefers-color-scheme: dark)`:
  - Light: bg `#fdfcf8`, text `#1c1b19`, muted `#57534e`, accent (green, "yes") `#0a6b45`.
  - Dark: bg `#121412`, text `#e8e6e1`, muted `#a8a29e`, accent `#5fd39a`.
  - Target: body and muted text at least 4.5:1, accent link text at least 4.5:1, focus ring at least 3:1 against bg. Exact values confirmed by the contrast test, adjusted if any fail.
- Small inline SVG mark (a check in a speech bubble, ~300 bytes) with `aria-hidden="true"` since the heading carries the meaning.
- Links underlined (color is not the only cue). Visible `:focus-visible` outline, 3px, offset 2px.
- `prefers-reduced-motion` respected (there is no motion planned, so this is a guard only).

## Content (draft, brief and casual)

- `<title>`: "AI contributions welcome"
- H1: "Yes, bots welcome."
- Para: "Code in this project was written partly or fully with help from AI tools. Pull requests made the same way are welcome here too."
- H2: "The only ask"
  - "You understand what you're sending and can answer questions about it."
  - "You ran it and it works."
  - "If AI did most of the work, a quick note in the PR is nice. Not required."
- H2: "Add the badge" with a `<pre><code>` Markdown snippet: `[![AI contributions welcome](https://yes.botsp.lease/badge.svg)](https://yes.botsp.lease/)`
- Footer: one line, e.g. "Made by humans, with some help."

## Markup and accessibility checklist

- `<!doctype html>`, `<html lang="en">`, charset and viewport metas, `<meta name="description">`, `<meta name="color-scheme" content="light dark">`.
- Landmarks: `<main>`, `<footer>`. One `<h1>`, ordered headings.
- Inline SVG favicon via `data:` URI to avoid a favicon 404 request.
- Badge `<img>` (if shown) with meaningful `alt`. Badge SVG itself has `role="img"`, `<title>`, and AA text contrast.

## Files

- `yes/dist/index.html` - the page
- `yes/dist/badge.svg` - README badge, ~600 bytes, flat style, text "AI contributions | welcome"
- `yes/package.json` - dev-only test scripts (no runtime deps)
- `yes/tests/` - test scripts below

## Success criteria

1. Single HTML request renders the full page. No external CSS, JS, fonts, or images requested by the page.
2. `index.html` under 5 KB and `badge.svg` under 1 KB uncompressed.
3. Zero violations from axe-core (via pa11y) in light and dark color schemes.
4. All text/background token pairs at least 4.5:1, focus ring at least 3:1, in both schemes. Badge text at least 4.5:1.
5. HTML passes `html-validate`.
6. No horizontal scroll at 320px width; content readable at 200% zoom.
7. Lighthouse accessibility and performance scores of 100 (mobile).

## Test cases (written first)

- `tests/size.test.mjs`: assert `index.html` < 5120 bytes, `badge.svg` < 1024 bytes.
- `tests/no-external.test.mjs`: parse `index.html`, assert no `<link rel=stylesheet>`, `<script src>`, `<img src>` with http(s), or `@import`/`url(http` in CSS.
- `tests/contrast.test.mjs`: extract the `:root` and dark-mode tokens from the inline `<style>`, compute WCAG relative luminance ratios for each fg/bg pair, assert thresholds above. Same for badge fill/text colors.
- `npm run validate`: `html-validate index.html`.
- `npm run a11y`: axe-core via `@axe-core/puppeteer` (pa11y cannot emulate prefers-color-scheme), light and dark, at 320px and 1280px, also asserts no horizontal scroll.
- Manual: Chrome DevTools at 320px and 200% zoom, keyboard tab through links to confirm visible focus, VoiceOver pass on heading order.

Use Node's built-in `node:test` runner to avoid a test framework dependency.

## Steps

1. Scaffold `package.json` with `node:test`, `html-validate`, `pa11y`, and a tiny static server (`npx serve` or `http-server`) as dev deps.
2. Write the tests above. Confirm they fail.
3. Write `index.html` and `badge.svg` to pass them.
4. Refactor: trim CSS, tighten copy, re-run tests. Run Lighthouse once by hand.
5. Update this plan's status to `completed`.

## Verification

- `cd yes && npm test && npm run validate && npm run a11y`
- Open `index.html` in Chrome, toggle light/dark via DevTools rendering emulation, check 320px width, run Lighthouse (mobile).
