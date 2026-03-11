/**
 * Avoid arbitrary z-index values (e.g. z-[999]). Baseline-ui rule.
 */

import path from "path";
import type { RuleContext, RuleResult } from "../../types.js";
import { walkByExtension, readFileLines } from "./scan-util.js";

export const name = "Avoid arbitrary z-index values";

const Z_ARBITRARY = /z-\[\d+\]/g;

export default async function check(context: RuleContext): Promise<RuleResult> {
  const violations: { file: string; line?: number; message?: string }[] = [];
  const repoPath = context.repoPath;

  for await (const filePath of walkByExtension(repoPath)) {
    const lines = await readFileLines(filePath);
    const relativePath = path.relative(repoPath, filePath);
    for (let i = 0; i < lines.length; i++) {
      const match = lines[i].match(Z_ARBITRARY);
      if (match) {
        violations.push({
          file: relativePath,
          line: i + 1,
          message: match[0],
        });
      }
    }
  }

  return {
    pass: violations.length === 0,
    message: name,
    violations: violations.length > 0 ? violations : undefined,
  };
}
