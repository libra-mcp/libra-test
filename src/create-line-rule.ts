/**
 * Factory for the most common rule pattern: walk files by extension, check each line.
 * Eliminates ~20 lines of boilerplate per rule.
 */

import path from "path";
import type { RuleContext, RuleResult, Violation } from "./types.js";
import { walkByExtension, readFileLines } from "./scan-util.js";

export interface LineRuleOptions {
  /** Display name shown in CLI output. */
  name: string;
  /** File extensions to scan (defaults to walkByExtension defaults). */
  extensions?: string[];
  /** Return a violation message string if the line fails, or null/undefined to pass. */
  check: (line: string, lineIndex: number) => string | null | undefined;
  /** Optional directory prefixes to skip (e.g. "src/templates/"). */
  skipPrefixes?: string[];
}

/**
 * Creates a standard rule check function from simple line-matching options.
 *
 * Usage in a .rule.ts file:
 * ```ts
 * import { createLineRule } from "../../create-line-rule.js";
 * const { name, default: check } = createLineRule({ ... });
 * export { name };
 * export default check;
 * ```
 */
export function createLineRule(opts: LineRuleOptions): {
  name: string;
  default: (context: RuleContext) => Promise<RuleResult>;
} {
  const checkFn = async (context: RuleContext): Promise<RuleResult> => {
    const violations: Violation[] = [];
    const repoPath = context.repoPath;

    for await (const filePath of walkByExtension(repoPath, opts.extensions)) {
      const relativePath = path.relative(repoPath, filePath);
      if (opts.skipPrefixes?.some((p) => relativePath.startsWith(p))) continue;
      const lines = await readFileLines(filePath);
      for (let i = 0; i < lines.length; i++) {
        const msg = opts.check(lines[i], i);
        if (msg != null) {
          violations.push({
            file: relativePath,
            line: i + 1,
            message: msg !== "" ? msg : undefined,
          });
        }
      }
    }

    return {
      pass: violations.length === 0,
      message: opts.name,
      violations: violations.length > 0 ? violations : undefined,
    };
  };

  return { name: opts.name, default: checkFn };
}
