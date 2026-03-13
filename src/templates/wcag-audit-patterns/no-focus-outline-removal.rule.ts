/**
 * Do not remove focus outlines without clear replacement.
 */
import { createLineRule } from "../../create-line-rule.js";

const rule = createLineRule({
  name: "Do not remove focus outline without replacement",
  extensions: [".css", ".scss", ".ts", ".tsx", ".jsx", ".vue", ".svelte", ".html"],
  check: (line, lineIndex, lines) => {
    const removesOutline =
      line.includes("focus:outline-none") ||
      line.includes("outline: none") ||
      line.includes("outline:none");
    if (!removesOutline) return null;
    const hasReplacement =
      line.includes("focus:ring") ||
      line.includes("focus-visible") ||
      line.includes("outline-offset");
    if (hasReplacement) return null;
    if (lines) {
      const block = lines.slice(lineIndex, lineIndex + 15).join(" ");
      if (
        /focus:ring|focus-visible|outline-offset|box-shadow\s*:\s*[^;]*0\s+0\s+0/.test(block)
      )
        return null;
    }
    return "focus outline removed without replacement";
  },
});

export const name = rule.name;
export default rule.default;
