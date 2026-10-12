import { test } from "node:test";
import assert from "node:assert/strict";
import { badgeFileNames, readDistFile } from "./helpers.mjs";

for (const badgeFileName of badgeFileNames) {
  const badgeSource = readDistFile(badgeFileName);

  test(`${badgeFileName}: outer width matches its rects so there is no empty tail`, () => {
    const outerWidth = Number(badgeSource.match(/<svg[^>]*\swidth="(\d+(?:\.\d+)?)"/)[1]);
    const rectWidths = [...badgeSource.matchAll(/<rect[^>]*\swidth="(\d+(?:\.\d+)?)"/g)].map((match) => Number(match[1]));
    assert.equal(rectWidths.reduce((total, width) => total + width, 0), outerWidth);
  });

  test(`${badgeFileName}: accessible name matches the visible text`, () => {
    const visibleText = [...badgeSource.matchAll(/<text[^>]*>([^<]+)<\/text>/g)].map((match) => match[1]).join(" ");
    const accessibleName = badgeSource.match(/aria-label="([^"]+)"/)[1];
    const normalize = (text) => text.toLowerCase().replace(/[^a-z ]/g, "").trim();
    assert.equal(normalize(accessibleName), normalize(visibleText));
  });
}
