/**
 * Shared file scanning for baseline-ui rules. Walks repo and returns files matching extensions.
 */

import { readdir } from "fs/promises";
import path from "path";

const DEFAULT_EXTENSIONS = [".tsx", ".jsx", ".vue", ".html", ".css"];

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
      if (
      e.name === "node_modules" ||
      e.name === ".git" ||
      e.name === "dist" ||
      e.name === ".next" ||
      e.name === "build" ||
      e.name === "out"
    )
      continue;
      yield* walkByExtension(full, exts);
    } else if (e.isFile() && exts.some((ext) => e.name.endsWith(ext))) {
      yield full;
    }
  }
}

export async function readFileLines(filePath: string): Promise<string[]> {
  const { readFile } = await import("fs/promises");
  const content = await readFile(filePath, "utf-8");
  return content.split(/\r?\n/);
}
