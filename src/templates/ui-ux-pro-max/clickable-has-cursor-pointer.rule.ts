/**
 * Non-button clickable elements (div/span with onClick) should have cursor-pointer.
 */

import path from "path";
import type { RuleContext, RuleResult } from "../../types.js";
import { walkByExtension, readFileLines } from "../../scan-util.js";

export const name = "Clickable non-button elements should have cursor-pointer";

const EXTENSIONS = [".tsx", ".jsx", ".vue", ".svelte"];

export default async function check(context: RuleContext): Promise<RuleResult> {
  const violations: { file: string; line?: number; message?: string }[] = [];
  for await (const filePath of walkByExtension(context.repoPath, EXTENSIONS)) {
    const lines = await readFileLines(filePath);
    const relativePath = path.relative(context.repoPath, filePath);
    if (relativePath.startsWith("src/templates/")) continue;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const isDivSpan = line.includes("<div") || line.includes("<span") || line.includes("<Div") || line.includes("<Span");
      const hasOnClick = line.includes("onClick") || line.includes("onclick");
      if (!isDivSpan || !hasOnClick) continue;
      if (line.includes("cursor-pointer") || line.includes("cursor:pointer")) continue;
      violations.push({ file: relativePath, line: i + 1 });
    }
  }
  return {
    pass: violations.length === 0,
    message: name,
    violations: violations.length ? violations : undefined,
  };
}
