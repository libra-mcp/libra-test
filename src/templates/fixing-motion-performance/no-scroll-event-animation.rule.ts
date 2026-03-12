/**
 * Avoid scroll event driven animation mutations.
 */

import path from "path";
import type { RuleContext, RuleResult } from "../../types.js";
import { walkByExtension, readFileLines } from "../../scan-util.js";

export const name = "Do not drive animation from scroll event handlers";

const EXTENSIONS = [".ts", ".tsx", ".js", ".jsx", ".vue", ".svelte"];

export default async function check(context: RuleContext): Promise<RuleResult> {
  const violations: { file: string; line?: number; message?: string }[] = [];

  for await (const filePath of walkByExtension(context.repoPath, EXTENSIONS)) {
    const lines = await readFileLines(filePath);
    const relativePath = path.relative(context.repoPath, filePath);
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const hasScrollListener =
        line.includes("addEventListener(\"scroll\"") ||
        line.includes("addEventListener('scroll'") ||
        line.includes("onscroll");
      const mutatesVisualState =
        line.includes(".style.") ||
        line.includes("setProperty(") ||
        line.includes("animate(") ||
        line.includes("scrollY");
      if (hasScrollListener && mutatesVisualState) {
        violations.push({ file: relativePath, line: i + 1 });
      }
    }
  }

  return {
    pass: violations.length === 0,
    message: name,
    violations: violations.length ? violations : undefined,
  };
}
