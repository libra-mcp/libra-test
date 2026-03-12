/**
 * Shared file scanning for template rules. Walks repo and returns files matching extensions.
 */

import { readdir, readFile } from "fs/promises";
import path from "path";

const DEFAULT_EXTENSIONS = [".tsx", ".jsx", ".vue", ".html", ".css", ".ts", ".js"];

const SKIP_DIRS = new Set([
  "node_modules",
  ".git",
  "dist",
  ".next",
  "build",
  "out",
]);

export async function* walkByExtension(
  dir: string,
  exts: string[] = DEFAULT_EXTENSIONS
): AsyncGenerator<string> {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (SKIP_DIRS.has(e.name)) continue;
      yield* walkByExtension(full, exts);
    } else if (e.isFile() && exts.some((ext) => e.name.endsWith(ext))) {
      yield full;
    }
  }
}

export async function readFileLines(filePath: string): Promise<string[]> {
  const content = await readFile(filePath, "utf-8");
  return content.split(/\r?\n/);
}
