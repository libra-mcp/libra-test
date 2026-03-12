/**
 * User-initiated motion should stay under 300ms.
 */

import path from "path";
import type { RuleContext, RuleResult } from "../../types.js";
import { walkByExtension, readFileLines } from "../../scan-util.js";

export const name = "Animation timing should not exceed 300ms";

const EXTENSIONS = [".css", ".scss", ".ts", ".tsx", ".js", ".jsx", ".vue", ".svelte"];
const MS_RE = /(\d+(?:\.\d+)?)ms/g;
const DURATION_RE = /duration\s*:\s*(\d+(?:\.\d+)?)/;

export default async function check(context: RuleContext): Promise<RuleResult> {
  const violations: { file: string; line?: number; message?: string }[] = [];
  for await (const filePath of walkByExtension(context.repoPath, EXTENSIONS)) {
    const lines = await readFileLines(filePath);
    const relativePath = path.relative(context.repoPath, filePath);
    if (relativePath.startsWith("src/templates/")) continue;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      MS_RE.lastIndex = 0;
      let match = MS_RE.exec(line);
      while (match) {
        const value = Number(match[1]);
        if (!Number.isNaN(value) && value > 300) {
          violations.push({ file: relativePath, line: i + 1, message: `${value}ms` });
        }
        match = MS_RE.exec(line);
      }
      const durationMatch = line.match(DURATION_RE);
      if (durationMatch) {
        const seconds = Number(durationMatch[1]);
        if (!Number.isNaN(seconds) && seconds > 0.3) {
          violations.push({ file: relativePath, line: i + 1, message: `duration:${seconds}s` });
        }
      }
    }
  }
  return {
    pass: violations.length === 0,
    message: name,
    violations: violations.length ? violations : undefined,
  };
}
