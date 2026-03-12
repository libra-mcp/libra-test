/**
 * Links should not be empty (no text or aria-label).
 */

import path from "path";
import type { RuleContext, RuleResult } from "../../types.js";
import { walkByExtension, readFileLines } from "../../scan-util.js";

export const name = "Link must not be empty";

const EXTENSIONS = [".html", ".htm", ".tsx", ".jsx", ".vue", ".svelte"];

export default async function check(context: RuleContext): Promise<RuleResult> {
  const violations: { file: string; line?: number; message?: string }[] = [];
  for await (const filePath of walkByExtension(context.repoPath, EXTENSIONS)) {
    const lines = await readFileLines(filePath);
    const relativePath = path.relative(context.repoPath, filePath);
    if (relativePath.startsWith("src/templates/")) continue;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!line.includes("<a ") && !line.includes("<Link ")) continue;
      if (line.includes("href=") && (line.includes("aria-label") || line.includes("aria-labelledby")))
        continue;
      const emptyContent = />\s*<\s*\/\s*a\s*>|>\s*<\s*\/\s*Link\s*>/i.test(line);
      if (emptyContent) violations.push({ file: relativePath, line: i + 1 });
    }
  }
  return {
    pass: violations.length === 0,
    message: name,
    violations: violations.length ? violations : undefined,
  };
}
