import { test } from "node:test";
import assert from "node:assert/strict";
import { readDistFile } from "./helpers.mjs";

const pageSource = readDistFile("index.html");

test("page has no external stylesheets", () => {
  assert.doesNotMatch(pageSource, /<link[^>]+rel=["']?stylesheet/i);
});

test("page has no scripts", () => {
  assert.doesNotMatch(pageSource, /<script/i);
});

test("page has no remote images", () => {
  assert.doesNotMatch(pageSource, /<img[^>]+src=["']?(https?:)?\/\//i);
});

test("inline CSS loads nothing remote", () => {
  assert.doesNotMatch(pageSource, /@import/i);
  assert.doesNotMatch(pageSource, /url\(\s*["']?(https?:)?\/\//i);
});

test("page has exactly one inline style block", () => {
  assert.equal(pageSource.match(/<style>/g)?.length, 1);
});
