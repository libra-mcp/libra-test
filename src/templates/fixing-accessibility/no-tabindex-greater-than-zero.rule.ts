/**
 * Do not use tabindex greater than 0. fixing-accessibility rule.
 * Positive tabindex breaks logical tab order.
 */

import path from "path";
import type { RuleContext, RuleResult } from "../../types.js";
import { walkByExtension, readFileLines } from "../../scan-util.js";

export const name = "Do not use tabindex greater than 0";

const TABINDEX_POSITIVE = /tabindex\s*=\s*[\{'"]([1-9]\d*)[\}'"]|tabIndex\s*=\s*[\{'"]([1-9]\d*)[\}'"]/;

export default async function check(context: RuleContext): Promise<RuleResult> {
  const violations: { file: string; line?: number; message?: string }[] = [];
  const repoPath = context.repoPath;

  for await (const filePath of walkByExtension(repoPath)) {
    const lines = await readFileLines(filePath);
    const relativePath = path.relative(repoPath, filePath);
    for (let i = 0; i < lines.length; i++) {
      const match = lines[i].match(TABINDEX_POSITIVE);
      if (match) {
        const value = match[1] ?? match[2];
        violations.push({
          file: relativePath,
          line: i + 1,
          message: `tabindex=${value}`,
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
