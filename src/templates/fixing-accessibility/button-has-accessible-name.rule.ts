/**
 * Button elements must have accessible name (visible text or aria-label/aria-labelledby).
 * fixing-accessibility: accessible names.
 */

import path from "path";
import type { RuleContext, RuleResult } from "../../types.js";
import { walkByExtension, readFileLines } from "../../scan-util.js";

export const name = "Button must have accessible name";

const EXTENSIONS = [".html", ".htm", ".tsx", ".jsx", ".vue", ".svelte"];

export default async function check(context: RuleContext): Promise<RuleResult> {
  const violations: { file: string; line?: number; message?: string }[] = [];
  for await (const filePath of walkByExtension(context.repoPath, EXTENSIONS)) {
    const lines = await readFileLines(filePath);
    const relativePath = path.relative(context.repoPath, filePath);
    if (relativePath.startsWith("src/templates/")) continue;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!line.includes("<button") && !line.includes("<Button")) continue;
      if (line.includes("aria-label") || line.includes("aria-labelledby")) continue;
      const hasText = />\s*[^<\s]+/.test(line) || line.includes("children");
      if (hasText) continue;
      violations.push({ file: relativePath, line: i + 1 });
    }
  }
  return {
    pass: violations.length === 0,
    message: name,
    violations: violations.length ? violations : undefined,
  };
}
