/**
 * <img> should include alt attribute.
 */
import { createLineRule } from "../../create-line-rule.js";

function imgMissingAlt(line: string, lineIndex: number, lines: string[] | undefined): string | null {
  if (!line.includes("<img") || line.includes("alt=")) return null;
  if (lines === undefined) return "";
  const block = lines.slice(lineIndex, lineIndex + 20).join(" ");
  if (block.includes("alt=")) return null;
  return "";
}

const rule = createLineRule({
  name: "Images must include alt attribute",
  extensions: [".html", ".htm", ".tsx", ".jsx", ".vue", ".svelte"],
  check: (line, lineIndex, lines) => imgMissingAlt(line, lineIndex, lines),
});

export const name = rule.name;
export default rule.default;
