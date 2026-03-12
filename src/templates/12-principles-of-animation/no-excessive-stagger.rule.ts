/**
 * Stagger delay should be subtle (<= 0.05s per item).
 */

import path from "path";
import type { RuleContext, RuleResult } from "../../types.js";
import { walkByExtension, readFileLines } from "../../scan-util.js";

export const name = "Do not use excessive staggerChildren delay";

const EXTENSIONS = [".ts", ".tsx", ".js", ".jsx", ".vue", ".svelte"];
const STAGGER = /staggerChildren\s*:\s*(\d+(?:\.\d+)?)/;

export default async function check(context: RuleContext): Promise<RuleResult> {
  const violations: { file: string; line?: number; message?: string }[] = [];
  for await (const filePath of walkByExtension(context.repoPath, EXTENSIONS)) {
    const lines = await readFileLines(filePath);
    const relativePath = path.relative(context.repoPath, filePath);
    for (let i = 0; i < lines.length; i++) {
      const match = lines[i].match(STAGGER);
      if (!match) continue;
      const value = Number(match[1]);
      if (Number.isNaN(value) || value <= 0.05) continue;
      violations.push({ file: relativePath, line: i + 1, message: `${value}s` });
    }
  }
  return {
    pass: violations.length === 0,
    message: name,
    violations: violations.length ? violations : undefined,
  };
}
