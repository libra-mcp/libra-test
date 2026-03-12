/**
 * Avoid arbitrary px text sizes; prefer Tailwind text scale.
 */

import path from "path";
import type { RuleContext, RuleResult } from "../../types.js";
import { walkByExtension, readFileLines } from "../../scan-util.js";

export const name = "Do not use arbitrary text-[Npx] classes";

const EXTENSIONS = [".tsx", ".jsx", ".vue", ".html", ".svelte"];
const TEXT_PX = /text-\[\d+px\]/;

export default async function check(context: RuleContext): Promise<RuleResult> {
  const violations: { file: string; line?: number; message?: string }[] = [];
  for await (const filePath of walkByExtension(context.repoPath, EXTENSIONS)) {
    const lines = await readFileLines(filePath);
    const relativePath = path.relative(context.repoPath, filePath);
    for (let i = 0; i < lines.length; i++) {
      const match = lines[i].match(TEXT_PX);
      if (!match) continue;
      violations.push({ file: relativePath, line: i + 1, message: match[0] });
    }
  }
  return {
    pass: violations.length === 0,
    message: name,
    violations: violations.length ? violations : undefined,
  };
}
