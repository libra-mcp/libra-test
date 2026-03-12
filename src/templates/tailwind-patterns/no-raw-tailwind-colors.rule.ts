/**
 * Prefer semantic color tokens over raw palette utilities.
 */

import path from "path";
import type { RuleContext, RuleResult } from "../../types.js";
import { walkByExtension, readFileLines } from "../../scan-util.js";

export const name = "Do not use raw Tailwind color classes";

const RAW_COLOR = /\b(?:bg|text|border|from|to|via)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}\b/;
const EXTENSIONS = [".tsx", ".jsx", ".vue", ".html", ".svelte"];

export default async function check(context: RuleContext): Promise<RuleResult> {
  const violations: { file: string; line?: number; message?: string }[] = [];

  for await (const filePath of walkByExtension(context.repoPath, EXTENSIONS)) {
    const lines = await readFileLines(filePath);
    const relativePath = path.relative(context.repoPath, filePath);
    for (let i = 0; i < lines.length; i++) {
      const match = lines[i].match(RAW_COLOR);
      if (!match) continue;
      violations.push({
        file: relativePath,
        line: i + 1,
        message: match[0],
      });
    }
  }

  return {
    pass: violations.length === 0,
    message: name,
    violations: violations.length ? violations : undefined,
  };
}
