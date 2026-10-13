import { test } from "node:test";
import assert from "node:assert/strict";
import { badgeFileNames, productionOrigin, readDistFile } from "./helpers.mjs";

const pageSource = readDistFile("index.html");

test("document declares language, viewport and color scheme", () => {
  assert.match(pageSource, /<html lang="en">/);
  assert.match(pageSource, /<meta name="viewport" content="width=device-width, initial-scale=1">/);
  assert.match(pageSource, /<meta name="color-scheme" content="light dark">/);
});

test("page has one h1 and a main landmark", () => {
  assert.equal(pageSource.match(/<h1[\s>]/g)?.length, 1);
  assert.match(pageSource, /<main[\s>]/);
});

test("favicon is inline so no extra request is made", () => {
  assert.match(pageSource, /<link rel="icon" href="data:image\/svg\+xml,/);
});

test("links have a visible focus style", () => {
  assert.match(pageSource, /:focus-visible\s*\{[^}]*outline:/);
});

test("canonical URL and badge snippets use the production domain", () => {
  assert.ok(pageSource.includes(`<link rel="canonical" href="${productionOrigin}">`));
  for (const badgeFileName of badgeFileNames) {
    assert.ok(
      pageSource.includes(`[![AI contributions welcome](${productionOrigin}${badgeFileName})](${productionOrigin})`),
      `missing snippet for ${badgeFileName}`,
    );
  }
  assert.doesNotMatch(pageSource, /example\.com|TODO/);
});

test("no file still points at the old botsp.lease domain", () => {
  for (const fileName of ["index.html", ...badgeFileNames]) {
    assert.doesNotMatch(readDistFile(fileName), /botsp\.lease/i, fileName);
  }
});

test("copy names agents, LLMs and AI", () => {
  const visibleText = pageSource.match(/<body>([\s\S]*)<\/body>/)[1].replace(/<[^>]+>/g, " ");
  for (const term of [/\bagents?\b/i, /\bLLMs?\b/, /\bAI\b/]) {
    assert.match(visibleText, term);
  }
});

test("Open Graph tags match the page title, description and canonical URL", () => {
  const pageTitle = pageSource.match(/<title>([^<]+)<\/title>/)[1];
  const pageDescription = pageSource.match(/<meta name="description" content="([^"]+)">/)[1];
  assert.ok(pageSource.includes(`<meta property="og:title" content="${pageTitle}">`));
  assert.ok(pageSource.includes(`<meta property="og:type" content="website">`));
  assert.ok(pageSource.includes(`<meta property="og:url" content="${productionOrigin}">`));
  assert.ok(pageSource.includes(`<meta property="og:description" content="${pageDescription}">`));
});
