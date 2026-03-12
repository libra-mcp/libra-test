/**
 * Do not remove focus outlines without clear replacement.
 */

import path from "path";
import type { RuleContext, RuleResult } from "../../types.js";
import { walkByExtension, readFileLines } from "../../scan-util.js";

export const name = "Do not remove focus outline without replacement";

const EXTENSIONS = [".css", ".scss", ".tsx", ".jsx", ".vue", ".svelte", ".html"];

export default async function check(context: RuleContext): Promise<RuleResult> {
  const violations: { file: string; line?: number; message?: string }[] = [];
  for await (const filePath of walkByExtension(context.repoPath, EXTENSIONS)) {
    const lines = await readFileLines(filePath);
    const relativePath = path.relative(context.repoPath, filePath);
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const removesOutline = line.includes("focus:outline-none") || line.includes("outline: none");
      if (!removesOutline) continue;
      const hasReplacement =
        line.includes("focus:ring") ||
        line.includes("focus-visible") ||
        line.includes("outline-offset");
      if (hasReplacement) continue;
      violations.push({ file: relativePath, line: i + 1 });
    }
  }
  return {
    pass: violations.length === 0,
    message: name,
    violations: violations.length ? violations : undefined,
  };
}
