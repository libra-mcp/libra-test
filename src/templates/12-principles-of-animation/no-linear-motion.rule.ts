/**
 * Avoid linear easing for movement animation.
 */

import path from "path";
import type { RuleContext, RuleResult } from "../../types.js";
import { walkByExtension, readFileLines } from "../../scan-util.js";

export const name = "Do not use linear easing for motion";

const EXTENSIONS = [".css", ".scss", ".ts", ".tsx", ".js", ".jsx", ".vue", ".svelte"];
const LINEAR_MOTION =
  /(transform|translate|scale|rotate|x\s*:|y\s*:|whileHover|whileTap).*(linear)|linear.*(transform|translate|scale|rotate|x\s*:|y\s*:)/i;

export default async function check(context: RuleContext): Promise<RuleResult> {
  const violations: { file: string; line?: number; message?: string }[] = [];
  for await (const filePath of walkByExtension(context.repoPath, EXTENSIONS)) {
    const lines = await readFileLines(filePath);
    const relativePath = path.relative(context.repoPath, filePath);
    if (relativePath.startsWith("src/templates/")) continue;
    for (let i = 0; i < lines.length; i++) {
      if (!LINEAR_MOTION.test(lines[i])) continue;
      violations.push({ file: relativePath, line: i + 1 });
    }
  }
  return {
    pass: violations.length === 0,
    message: name,
    violations: violations.length ? violations : undefined,
  };
}
