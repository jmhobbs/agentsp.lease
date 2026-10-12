import puppeteer from "puppeteer";
import { AxePuppeteer } from "@axe-core/puppeteer";
import { pathToFileURL } from "node:url";
import { distFilePath } from "./helpers.mjs";

const pageUrl = pathToFileURL(distFilePath("index.html")).href;
const viewportWidths = [320, 1280];
const colorSchemes = ["light", "dark"];

async function auditPage(browser, colorScheme, viewportWidth) {
  const page = await browser.newPage();
  await page.setViewport({ width: viewportWidth, height: 800 });
  await page.emulateMediaFeatures([{ name: "prefers-color-scheme", value: colorScheme }]);
  await page.goto(pageUrl);

  const axeResults = await new AxePuppeteer(page).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa", "best-practice"]).analyze();
  const hasHorizontalScroll = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  await page.close();

  const problems = axeResults.violations.map((violation) => `${violation.id}: ${violation.help}`);
  if (hasHorizontalScroll) {
    problems.push("page scrolls horizontally");
  }
  return problems;
}

const browser = await puppeteer.launch();
let failureCount = 0;
try {
  for (const colorScheme of colorSchemes) {
    for (const viewportWidth of viewportWidths) {
      const problems = await auditPage(browser, colorScheme, viewportWidth);
      const label = `${colorScheme} @ ${viewportWidth}px`;
      if (problems.length === 0) {
        console.log(`ok   ${label}`);
      } else {
        failureCount += problems.length;
        console.log(`FAIL ${label}\n  ${problems.join("\n  ")}`);
      }
    }
  }
} finally {
  await browser.close();
}
process.exitCode = failureCount === 0 ? 0 : 1;
