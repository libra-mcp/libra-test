/**
 * Keyframe-heavy stylesheets should include reduced-motion fallback.
 */

import path from "path";
import type { RuleContext, RuleResult } from "../../types.js";
import { walkByExtension, readFileLines } from "../../scan-util.js";

export const name = "CSS keyframes should have reduced-motion fallback";

const EXTENSIONS = [".css", ".scss"];

export default async function check(context: RuleContext): Promise<RuleResult> {
  const violations: { file: string; line?: number; message?: string }[] = [];
  for await (const filePath of walkByExtension(context.repoPath, EXTENSIONS)) {
    const lines = await readFileLines(filePath);
    const relativePath = path.relative(context.repoPath, filePath);
    if (relativePath.startsWith("src/templates/")) continue;
    const hasKeyframes = lines.some((line) => line.includes("@keyframes"));
    if (!hasKeyframes) continue;
    const hasReducedMotion = lines.some((line) => line.includes("prefers-reduced-motion"));
    if (!hasReducedMotion) {
      violations.push({ file: relativePath, message: "missing prefers-reduced-motion" });
    }
  }
  return {
    pass: violations.length === 0,
    message: name,
    violations: violations.length ? violations : undefined,
  };
}
