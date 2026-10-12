import { test } from "node:test";
import assert from "node:assert/strict";
import { statSync } from "node:fs";
import { badgeFileNames, distFilePath } from "./helpers.mjs";

const sizeBudgetsInBytes = {
  "index.html": 5120,
  ...Object.fromEntries(badgeFileNames.map((badgeFileName) => [badgeFileName, 1024])),
};

for (const [fileName, maximumBytes] of Object.entries(sizeBudgetsInBytes)) {
  test(`${fileName} is under ${maximumBytes} bytes`, () => {
    const actualBytes = statSync(distFilePath(fileName)).size;
    assert.ok(actualBytes < maximumBytes, `${fileName} is ${actualBytes} bytes`);
  });
}
