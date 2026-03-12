/**
 * Avoid if-let branching inside sheet body closure.
 */

import path from "path";
import type { RuleContext, RuleResult } from "../../types.js";
import { walkByExtension, readFileLines } from "../../scan-util.js";

export const name = "Avoid if let inside .sheet body";

const EXTENSIONS = [".swift"];

export default async function check(context: RuleContext): Promise<RuleResult> {
  const violations: { file: string; line?: number; message?: string }[] = [];
  for await (const filePath of walkByExtension(context.repoPath, EXTENSIONS)) {
    const lines = await readFileLines(filePath);
    const relativePath = path.relative(context.repoPath, filePath);
    for (let i = 0; i < lines.length; i++) {
      if (!lines[i].includes(".sheet(")) continue;
      const window = lines.slice(i, Math.min(lines.length, i + 20)).join("\n");
      if (!window.includes("if let")) continue;
      violations.push({ file: relativePath, line: i + 1, message: "if let in sheet closure" });
    }
  }
  return {
    pass: violations.length === 0,
    message: name,
    violations: violations.length ? violations : undefined,
  };
}
