/**
 * prefers-reduced-motion blocks should set animation/transition duration to 0.01ms (or 0s).
 */
import path from "path";
import type { RuleContext, RuleResult } from "../../types.js";
import { walkByExtension, readFileLines } from "../../scan-util.js";

export const name = "Reduced-motion block must set duration to 0.01ms or 0s";

const EXTENSIONS = [".css", ".scss"];
const REDUCED_MOTION = /prefers-reduced-motion\s*:\s*reduce/;
const MINIMAL_DURATION = /(?:animation|transition)-duration\s*:\s*(?:0\.01ms|0\.001ms|0s)\s*(!important)?/i;

export default async function check(context: RuleContext): Promise<RuleResult> {
  const violations: { file: string; line?: number; message?: string }[] = [];
  for await (const filePath of walkByExtension(context.repoPath, EXTENSIONS)) {
    const lines = await readFileLines(filePath);
    const relativePath = path.relative(context.repoPath, filePath);
    if (relativePath.startsWith("src/templates/")) continue;

    let inBlock = false;
    let blockDepth = 0;
    let startLine = 0;
    let seenMinimalDuration = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (REDUCED_MOTION.test(line)) {
        inBlock = true;
        blockDepth = (line.match(/{/g) || []).length - (line.match(/}/g) || []).length;
        startLine = i + 1;
        seenMinimalDuration = MINIMAL_DURATION.test(line);
      }
      if (inBlock) {
        if (!seenMinimalDuration && MINIMAL_DURATION.test(line)) seenMinimalDuration = true;
        blockDepth += (line.match(/{/g) || []).length - (line.match(/}/g) || []).length;
        if (blockDepth <= 0) {
          if (!seenMinimalDuration) {
            violations.push({
              file: relativePath,
              line: startLine,
              message:
                "prefers-reduced-motion block should set animation-duration and transition-duration to 0.01ms or 0s",
            });
          }
          inBlock = false;
        }
      }
    }
    if (inBlock && !seenMinimalDuration) {
      violations.push({
        file: relativePath,
        line: startLine,
        message:
          "prefers-reduced-motion block should set animation-duration and transition-duration to 0.01ms or 0s",
      });
    }
  }
  return {
    pass: violations.length === 0,
    message: name,
    violations: violations.length ? violations : undefined,
  };
}
