import { test } from "node:test";
import assert from "node:assert/strict";
import { badgeFileNames, readDistFile } from "./helpers.mjs";
import { contrastRatio, parseCustomProperties } from "./contrast.mjs";

const textMinimum = 4.5;
const nonTextMinimum = 3;

const pageSource = readDistFile("index.html");
const styleBlock = pageSource.match(/<style>([\s\S]*?)<\/style>/)[1];
const darkSchemeStart = styleBlock.indexOf("prefers-color-scheme: dark");

const colorSchemes = {
  light: parseCustomProperties(styleBlock.slice(0, darkSchemeStart)),
  dark: parseCustomProperties(styleBlock.slice(darkSchemeStart)),
};

const requiredPairs = [
  { foreground: "text", background: "bg", minimum: textMinimum },
  { foreground: "muted", background: "bg", minimum: textMinimum },
  { foreground: "accent", background: "bg", minimum: textMinimum },
  { foreground: "text", background: "code-bg", minimum: textMinimum },
  { foreground: "accent", background: "code-bg", minimum: textMinimum },
  { foreground: "focus", background: "bg", minimum: nonTextMinimum },
];

test("dark scheme overrides exist", () => {
  assert.ok(darkSchemeStart > 0, "missing prefers-color-scheme: dark block");
});

for (const [schemeName, tokens] of Object.entries(colorSchemes)) {
  for (const { foreground, background, minimum } of requiredPairs) {
    test(`${schemeName}: --${foreground} on --${background} is at least ${minimum}:1`, () => {
      assert.ok(tokens[foreground], `--${foreground} not defined`);
      assert.ok(tokens[background], `--${background} not defined`);
      const ratio = contrastRatio(tokens[foreground], tokens[background]);
      assert.ok(ratio >= minimum, `ratio is ${ratio.toFixed(2)}:1`);
    });
  }
}

for (const badgeFileName of badgeFileNames) {
  test(`${badgeFileName}: text meets AA on both badge halves`, () => {
    const badgeSource = readDistFile(badgeFileName);
    const fills = [...badgeSource.matchAll(/<(?:rect|path)[^>]*fill="(#[0-9a-f]{3,6})"/gi)].map((match) => match[1]);
    const textFill = badgeSource.match(/<g[^>]*fill="(#[0-9a-f]{3,6})"[^>]*>\s*<text/i)?.[1];
    assert.ok(fills.length >= 2, "expected two badge background fills");
    assert.ok(textFill, "expected a text fill on the <g> wrapping <text>");
    for (const backgroundFill of fills) {
      const ratio = contrastRatio(textFill, backgroundFill);
      assert.ok(ratio >= textMinimum, `${textFill} on ${backgroundFill} is ${ratio.toFixed(2)}:1`);
    }
  });

  test(`${badgeFileName}: is labelled for assistive tech`, () => {
    const badgeSource = readDistFile(badgeFileName);
    assert.match(badgeSource, /role="img"/);
    assert.match(badgeSource, /<title>[^<]+<\/title>/);
  });
}

test("contrast math matches known reference values", () => {
  assert.equal(contrastRatio("#000000", "#ffffff").toFixed(2), "21.00");
  assert.equal(contrastRatio("#777777", "#ffffff").toFixed(2), "4.48");
});
