/**
 * Interaction feedback must not exceed 200ms. Baseline-ui rule.
 */
import path from "path";
import type { RuleContext, RuleResult } from "../../types.js";
import { walkByExtension, readFileLines } from "../../scan-util.js";

export const name = "Do not exceed 200ms for interaction animation";

const EXTENSIONS = [".css", ".scss", ".ts", ".tsx", ".js", ".jsx", ".vue", ".svelte", ".html"];
const TAILWIND_DURATION =
  /duration-(?:\[([2-9]\d{2}|[1-9]\d{3,})\]|([2-9]\d{2}|[1-9]\d{3,})|(300|500|700|1000))\b/;
const CSS_MS = /(\d+(?:\.\d+)?)\s*ms/g;
const CSS_DURATION = /(?:animation-)?duration\s*:\s*(\d+(?:\.\d+)?)\s*s/;

export default async function check(context: RuleContext): Promise<RuleResult> {
  const violations: { file: string; line?: number; message?: string }[] = [];
  for await (const filePath of walkByExtension(context.repoPath, EXTENSIONS)) {
    const lines = await readFileLines(filePath);
    const relativePath = path.relative(context.repoPath, filePath);
    if (relativePath.startsWith("src/templates/")) continue;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const twMatch = line.match(TAILWIND_DURATION);
      if (twMatch) {
        const value = Number(twMatch[1] ?? twMatch[2] ?? twMatch[3]);
        if (!Number.isNaN(value) && value > 200) {
          violations.push({ file: relativePath, line: i + 1, message: `duration ${value}ms` });
        }
      }
      let msMatch = CSS_MS.exec(line);
      while (msMatch) {
        const value = Number(msMatch[1]);
        if (!Number.isNaN(value) && value > 200) {
          violations.push({ file: relativePath, line: i + 1, message: `${value}ms` });
        }
        msMatch = CSS_MS.exec(line);
      }
      const durationMatch = line.match(CSS_DURATION);
      if (durationMatch) {
        const seconds = Number(durationMatch[1]);
        if (!Number.isNaN(seconds) && seconds > 0.2) {
          violations.push({ file: relativePath, line: i + 1, message: `duration ${seconds}s` });
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
