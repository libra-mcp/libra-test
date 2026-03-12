/**
 * Files that define transitions or animations should respect prefers-reduced-motion. Fixing-motion-performance rule.
 */
import path from "path";
import type { RuleContext, RuleResult } from "../../types.js";
import { walkByExtension, readFileLines } from "../../scan-util.js";

export const name = "Animation requires reduced-motion fallback";

const EXTENSIONS = [".css", ".scss", ".tsx", ".jsx", ".vue", ".ts", ".js", ".svelte", ".html"];

function hasAnimationOrTransition(lines: string[]): boolean {
  const text = lines.join("\n");
  return (
    lines.some((l) => l.includes("@keyframes")) ||
    lines.some((l) => l.includes("transition")) ||
    lines.some((l) => l.includes("animation")) ||
    text.includes("animate(") ||
    text.includes("transition:")
  );
}

function hasReducedMotion(lines: string[]): boolean {
  return lines.some((l) => l.includes("prefers-reduced-motion"));
}

const SKIP_PREFIXES = ["libra-test/", "src/templates/", ".libra/rules/"];

export default async function check(context: RuleContext): Promise<RuleResult> {
  const violations: { file: string; message?: string }[] = [];
  for await (const filePath of walkByExtension(context.repoPath, EXTENSIONS)) {
    const lines = await readFileLines(filePath);
    const relativePath = path.relative(context.repoPath, filePath);
    if (SKIP_PREFIXES.some((p) => relativePath.startsWith(p))) continue;
    if (!hasAnimationOrTransition(lines)) continue;
    if (!hasReducedMotion(lines)) {
      violations.push({ file: relativePath, message: "missing prefers-reduced-motion" });
    }
  }
  return {
    pass: violations.length === 0,
    message: name,
    violations: violations.length ? violations : undefined,
  };
}
