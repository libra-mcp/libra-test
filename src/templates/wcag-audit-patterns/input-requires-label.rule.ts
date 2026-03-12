/**
 * Input (text, email, password, etc.) should have aria-label or id for label association.
 * Heuristic: same line has type= text|email|password|search|tel|url and neither aria-label nor id=.
 */

import path from "path";
import type { RuleContext, RuleResult } from "../../types.js";
import { walkByExtension, readFileLines } from "../../scan-util.js";

export const name = "Form input should have label or aria-label";

const EXTENSIONS = [".html", ".htm", ".tsx", ".jsx", ".vue", ".svelte"];
const INPUT_TYPE = /type\s*=\s*["'](?:text|email|password|search|tel|url)["']/i;

export default async function check(context: RuleContext): Promise<RuleResult> {
  const violations: { file: string; line?: number; message?: string }[] = [];
  for await (const filePath of walkByExtension(context.repoPath, EXTENSIONS)) {
    const lines = await readFileLines(filePath);
    const relativePath = path.relative(context.repoPath, filePath);
    if (relativePath.startsWith("src/templates/")) continue;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!line.includes("<input")) continue;
      if (!INPUT_TYPE.test(line)) continue;
      if (line.includes("aria-label") || line.includes("aria-labelledby")) continue;
      if (line.includes("id=")) continue;
      violations.push({ file: relativePath, line: i + 1 });
    }
  }
  return {
    pass: violations.length === 0,
    message: name,
    violations: violations.length ? violations : undefined,
  };
}
