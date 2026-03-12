/**
 * Do not use div or span as buttons without full keyboard support. fixing-accessibility rule.
 * Heuristic: div or span with onClick/onclick without role="button".
 */

import path from "path";
import type { RuleContext, RuleResult } from "../../types.js";
import { walkByExtension, readFileLines } from "../../scan-util.js";

export const name = "Do not use div/span as button without role and keyboard support";

const JSX_EXTENSIONS = [".tsx", ".jsx", ".vue"];

export default async function check(context: RuleContext): Promise<RuleResult> {
  const violations: { file: string; line?: number; message?: string }[] = [];
  const repoPath = context.repoPath;

  for await (const filePath of walkByExtension(repoPath, JSX_EXTENSIONS)) {
    const lines = await readFileLines(filePath);
    const relativePath = path.relative(repoPath, filePath);
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const hasDivOrSpan =
        line.includes("<div") || line.includes("<span") || line.includes("<Div") || line.includes("<Span");
      const hasOnClick = line.includes("onClick") || line.includes("onclick");
      const hasRoleButton = line.includes('role="button"') || line.includes("role={'button'}") || line.includes('role=\'button\'');
      if (hasDivOrSpan && hasOnClick && !hasRoleButton) {
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
