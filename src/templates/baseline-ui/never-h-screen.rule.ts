/**
 * Never use h-screen (use h-dvh). Baseline-ui rule.
 */

import path from "path";
import type { RuleContext, RuleResult } from "../../types.js";
import { walkByExtension, readFileLines } from "./scan-util.js";

export const name = "Never use h-screen (use h-dvh)";

export default async function check(context: RuleContext): Promise<RuleResult> {
  const violations: { file: string; line?: number; message?: string }[] = [];
  const repoPath = context.repoPath;

  for await (const filePath of walkByExtension(repoPath)) {
    const lines = await readFileLines(filePath);
    const relativePath = path.relative(repoPath, filePath);
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes("h-screen")) {
        violations.push({ file: relativePath, line: i + 1 });
      }
    }
  }

  return {
    pass: violations.length === 0,
    message: name,
    violations: violations.length > 0 ? violations : undefined,
  };
}
