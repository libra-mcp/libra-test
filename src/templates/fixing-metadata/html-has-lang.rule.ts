/**
 * HTML must have lang attribute. fixing-metadata rule.
 * Heuristic: .html files with <html but no lang= in the same file.
 */

import path from "path";
import type { RuleContext, RuleResult } from "../../types.js";
import { readFile } from "fs/promises";

export const name = "HTML must have lang attribute";

const HTML_EXTENSIONS = [".html", ".htm"];

async function* walkHtml(repoPath: string, dir: string): AsyncGenerator<string> {
  const { readdir } = await import("fs/promises");
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (
        e.name === "node_modules" ||
        e.name === ".git" ||
        e.name === "dist" ||
        e.name === ".next" ||
        e.name === "build" ||
        e.name === "out"
      )
        continue;
      yield* walkHtml(repoPath, full);
    } else if (e.isFile() && HTML_EXTENSIONS.some((ext) => e.name.endsWith(ext))) {
      yield full;
    }
  }
}

export default async function check(context: RuleContext): Promise<RuleResult> {
  const violations: { file: string; line?: number; message?: string }[] = [];
  const repoPath = context.repoPath;

  for await (const filePath of walkHtml(repoPath, repoPath)) {
    const content = await readFile(filePath, "utf-8");
    const relativePath = path.relative(repoPath, filePath);
    if (/<html\s[^>]*>/.test(content) && !/<html[^>]*\slang\s*=/.test(content) && !/<html[^>]*\slang\s*:/.test(content)) {
      const lineNum = content.split(/\r?\n/).findIndex((l) => /<html/.test(l)) + 1;
      violations.push({
        file: relativePath,
        line: lineNum > 0 ? lineNum : undefined,
        message: "missing lang",
      });
    }
  }

  return {
    pass: violations.length === 0,
    message: name,
    violations: violations.length > 0 ? violations : undefined,
  };
}
