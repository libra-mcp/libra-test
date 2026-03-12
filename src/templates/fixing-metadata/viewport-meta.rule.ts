/**
 * HTML pages should include viewport meta for responsive behavior.
 */

import path from "path";
import { readFile } from "fs/promises";
import type { RuleContext, RuleResult } from "../../types.js";
import { walkByExtension } from "../../scan-util.js";

export const name = "HTML should include viewport meta";

const EXTENSIONS = [".html", ".htm"];

export default async function check(context: RuleContext): Promise<RuleResult> {
  const violations: { file: string; line?: number; message?: string }[] = [];
  for await (const filePath of walkByExtension(context.repoPath, EXTENSIONS)) {
    const relativePath = path.relative(context.repoPath, filePath);
    if (relativePath.startsWith("src/templates/")) continue;
    const fullContent = await readFile(filePath, "utf-8");
    const hasHtml = /<html[\s>]/.test(fullContent) || /<!DOCTYPE\s+html/i.test(fullContent);
    if (!hasHtml) continue;
    const hasViewport =
      /<meta[^>]*name\s*=\s*["']viewport["'][^>]*>/.test(fullContent) ||
      /<meta[^>]*content\s*=[^>]*name\s*=\s*["']viewport["']/.test(fullContent);
    if (!hasViewport) {
      violations.push({ file: relativePath, message: "missing viewport meta" });
    }
  }
  return {
    pass: violations.length === 0,
    message: name,
    violations: violations.length ? violations : undefined,
  };
}
