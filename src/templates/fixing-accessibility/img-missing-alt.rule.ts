/**
 * <img> must include alt attribute (meaningful or empty for decorative).
 * fixing-accessibility: media and motion.
 */
import { createLineRule } from "../../create-line-rule.js";

/** Report violation only if this line starts an <img> and neither it nor the next lines (same element) contain alt=. */
function imgMissingAlt(line: string, lineIndex: number, lines: string[] | undefined): string | null {
  if (!line.includes("<img") || line.includes("alt=")) return null;
  if (lines === undefined) return "img missing alt";
  const block = lines.slice(lineIndex, lineIndex + 20).join(" ");
  if (block.includes("alt=")) return null;
  return "img missing alt";
}

const rule = createLineRule({
  name: "Images must include alt attribute",
  extensions: [".html", ".htm", ".tsx", ".jsx", ".vue", ".svelte"],
  skipPrefixes: ["src/templates/"],
  check: (line, lineIndex, lines) => imgMissingAlt(line, lineIndex, lines),
});

export const name = rule.name;
export default rule.default;
