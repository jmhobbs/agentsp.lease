import { test } from "node:test";
import assert from "node:assert/strict";
import { readDistFile } from "./helpers.mjs";

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

test("canonical URL and badge snippet use the production domain", () => {
  assert.match(pageSource, /<link rel="canonical" href="https:\/\/yes\.botsp\.lease\/">/);
  assert.ok(pageSource.includes("[![AI contributions welcome](https://yes.botsp.lease/badge.svg)](https://yes.botsp.lease/)"));
  assert.doesNotMatch(pageSource, /example\.com|TODO/);
});
