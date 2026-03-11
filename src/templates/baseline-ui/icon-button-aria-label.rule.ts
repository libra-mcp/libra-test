/**
 * Icon-only buttons must have aria-label. Baseline-ui rule.
 * Heuristic: line contains <button or <Button and does not contain aria-label.
 */

import path from "path";
import type { RuleContext, RuleResult } from "../../types.js";
import { walkByExtension, readFileLines } from "./scan-util.js";

export const name = "Icon-only buttons must have aria-label";

const JSX_EXTENSIONS = [".tsx", ".jsx", ".vue"];

export default async function check(context: RuleContext): Promise<RuleResult> {
  const violations: { file: string; line?: number; message?: string }[] = [];
  const repoPath = context.repoPath;

  for await (const filePath of walkByExtension(repoPath, JSX_EXTENSIONS)) {
    const lines = await readFileLines(filePath);
    const relativePath = path.relative(repoPath, filePath);
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (
        (line.includes("<button") || line.includes("<Button")) &&
        !line.includes("aria-label")
      ) {
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
