import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const distRoot = fileURLToPath(new URL("../dist/", import.meta.url));

export function readDistFile(relativePath) {
  return readFileSync(distRoot + relativePath, "utf8");
}

export function distFilePath(relativePath) {
  return distRoot + relativePath;
}
