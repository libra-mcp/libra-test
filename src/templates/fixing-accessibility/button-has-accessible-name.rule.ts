/**
 * Button elements must have accessible name (visible text or aria-label/aria-labelledby).
 * fixing-accessibility: accessible names.
 */

import path from "path";
import type { RuleContext, RuleResult } from "../../types.js";
import { walkByExtension, readFileLines } from "../../scan-util.js";

export const name = "Button must have accessible name";

const EXTENSIONS = [".html", ".htm", ".tsx", ".jsx", ".vue", ".svelte"];
const HAS_ACCESSIBLE_NAME = /aria-label\s*=|aria-labelledby\s*=/;

/** Collect the opening tag (from line i until we see >). */
function getOpeningTag(lineIndex: number, lines: string[]): string {
  let tag = "";
  for (let j = lineIndex; j < Math.min(lineIndex + 25, lines.length); j++) {
    tag += lines[j] + " ";
    if (lines[j].includes(">")) break;
  }
  return tag;
}

/** Check if button body (until </button>) has visible text. */
function bodyHasText(lineIndex: number, lines: string[]): boolean {
  for (let j = lineIndex; j < Math.min(lineIndex + 40, lines.length); j++) {
    if (/\>\s*[^<\s{}]+/.test(lines[j])) return true;
    if (/<\/(?:button|Button)\s*>/.test(lines[j])) break;
  }
  return false;
}

export default async function check(context: RuleContext): Promise<RuleResult> {
  const violations: { file: string; line?: number; message?: string }[] = [];
  for await (const filePath of walkByExtension(context.repoPath, EXTENSIONS)) {
    const lines = await readFileLines(filePath);
    const relativePath = path.relative(context.repoPath, filePath);
    if (relativePath.startsWith("src/templates/")) continue;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!line.includes("<button") && !line.includes("<Button")) continue;
      const openingTag = getOpeningTag(i, lines);
      if (HAS_ACCESSIBLE_NAME.test(openingTag)) continue;
      if (bodyHasText(i, lines)) continue;
      violations.push({ file: relativePath, line: i + 1 });
    }
  }
  return {
    pass: violations.length === 0,
    message: name,
    violations: violations.length ? violations : undefined,
  };
}
