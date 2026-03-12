/**
 * Open Graph and Twitter card images must use absolute URLs (no relative, no localhost). fixing-metadata rule.
 */

import path from "path";
import type { RuleContext, RuleResult } from "../../types.js";
import { walkByExtension, readFileLines } from "../../scan-util.js";

export const name = "og:image and twitter:image must use absolute URLs";

const PAGE_EXTENSIONS = [".html", ".htm", ".tsx", ".jsx", ".vue"];

// Match meta property="og:image" content="..." or name="twitter:image" content="..."
const OG_IMAGE = /(?:property|name)\s*=\s*["'](?:og:image|twitter:image)["'][^>]*content\s*=\s*["']([^"']*)["']|content\s*=\s*["']([^"']*)["'][^>]*(?:property|name)\s*=\s*["'](?:og:image|twitter:image)["']/gi;

function isRelativeOrLocalhost(url: string): boolean {
  const trimmed = url.trim();
  if (!trimmed) return true;
  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) return true;
  if (/^https?:\/\/localhost\b/i.test(trimmed)) return true;
  if (/^https?:\/\/127\.0\.0\.1\b/i.test(trimmed)) return true;
  return false;
}

export default async function check(context: RuleContext): Promise<RuleResult> {
  const violations: { file: string; line?: number; message?: string }[] = [];
  for await (const filePath of walkByExtension(context.repoPath, PAGE_EXTENSIONS)) {
    const lines = await readFileLines(filePath);
    const relativePath = path.relative(context.repoPath, filePath);
    if (relativePath.startsWith("src/templates/")) continue;
    const content = lines.join("\n");
    let match: RegExpExecArray | null;
    OG_IMAGE.lastIndex = 0;
    while ((match = OG_IMAGE.exec(content)) !== null) {
      const url = (match[1] ?? match[2] ?? "").replace(/&quot;/g, '"');
      if (isRelativeOrLocalhost(url)) {
        const lineNum = content.slice(0, match.index).split(/\r?\n/).length;
        violations.push({
          file: relativePath,
          line: lineNum > 0 ? lineNum : undefined,
          message: "og:image or twitter:image must use absolute URL (no relative or localhost)",
        });
      }
    }
  }
  return {
    pass: violations.length === 0,
    message: name,
    violations: violations.length ? violations : undefined,
  };
}
