/**
 * Avoid will-change on layout-triggering properties; prefer transform/opacity.
 */

import path from "path";
import type { RuleContext, RuleResult } from "../../types.js";
import { walkByExtension, readFileLines } from "../../scan-util.js";

export const name = "Do not use will-change for layout properties";

const EXTENSIONS = [".css", ".scss", ".ts", ".tsx", ".js", ".jsx", ".vue", ".svelte"];
const WILL_LAYOUT = /will-change\s*:\s*[^;}\s]*(?:width|height|left|right|top|bottom|margin|padding)/i;

export default async function check(context: RuleContext): Promise<RuleResult> {
  const violations: { file: string; line?: number; message?: string }[] = [];
  for await (const filePath of walkByExtension(context.repoPath, EXTENSIONS)) {
    const lines = await readFileLines(filePath);
    const relativePath = path.relative(context.repoPath, filePath);
    if (relativePath.startsWith("src/templates/")) continue;
    for (let i = 0; i < lines.length; i++) {
      if (!WILL_LAYOUT.test(lines[i])) continue;
      violations.push({ file: relativePath, line: i + 1 });
    }
  }
  return {
    pass: violations.length === 0,
    message: name,
    violations: violations.length ? violations : undefined,
  };
}
