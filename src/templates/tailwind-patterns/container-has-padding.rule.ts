/**
 * Container pattern (max-w-* mx-auto) should include horizontal padding on same element.
 */

import path from "path";
import type { RuleContext, RuleResult } from "../../types.js";
import { walkByExtension, readFileLines } from "../../scan-util.js";

export const name = "Container should include horizontal padding";

const EXTENSIONS = [".tsx", ".jsx", ".vue", ".html", ".svelte"];
const CONTAINER = /max-w-(?:4xl|5xl|6xl|7xl)\s+mx-auto|mx-auto\s+max-w-(?:4xl|5xl|6xl|7xl)/;
const PADDING = /p[xltr]?-|px-\d|px-\w+/;

export default async function check(context: RuleContext): Promise<RuleResult> {
  const violations: { file: string; line?: number; message?: string }[] = [];
  for await (const filePath of walkByExtension(context.repoPath, EXTENSIONS)) {
    const lines = await readFileLines(filePath);
    const relativePath = path.relative(context.repoPath, filePath);
    if (relativePath.startsWith("src/templates/")) continue;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!CONTAINER.test(line)) continue;
      if (PADDING.test(line)) continue;
      violations.push({ file: relativePath, line: i + 1 });
    }
  }
  return {
    pass: violations.length === 0,
    message: name,
    violations: violations.length ? violations : undefined,
  };
}
