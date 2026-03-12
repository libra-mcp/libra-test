/**
 * HTML pages should include at least one favicon. fixing-metadata rule.
 */

import path from "path";
import { readFile } from "fs/promises";
import type { RuleContext, RuleResult } from "../../types.js";
import { walkByExtension } from "../../scan-util.js";

export const name = "HTML page should include favicon";

const EXTENSIONS = [".html", ".htm"];
const FAVICON =
  /<link[^>]*rel\s*=\s*["'](?:[^"']*\s+)?(?:icon|shortcut\s+icon)(?:\s+[^"']*)?["'][^>]*>|<link[^>]*href\s*=[^>]*rel\s*=\s*["'](?:icon|shortcut\s+icon)["']/i;

export default async function check(context: RuleContext): Promise<RuleResult> {
  const violations: { file: string; line?: number; message?: string }[] = [];
  for await (const filePath of walkByExtension(context.repoPath, EXTENSIONS)) {
    const relativePath = path.relative(context.repoPath, filePath);
    if (relativePath.startsWith("src/templates/")) continue;
    const fullContent = await readFile(filePath, "utf-8");
    const hasHtml = /<html[\s>]/.test(fullContent) || /<!DOCTYPE\s+html/i.test(fullContent);
    if (!hasHtml) continue;
    if (!FAVICON.test(fullContent)) {
      violations.push({ file: relativePath, message: "missing favicon (link rel=\"icon\")" });
    }
  }
  return {
    pass: violations.length === 0,
    message: name,
    violations: violations.length ? violations : undefined,
  };
}
