/**
 * Do not remove focus outlines without clear replacement.
 */
import { createLineRule } from "../../create-line-rule.js";

const rule = createLineRule({
  name: "Do not remove focus outline without replacement",
  extensions: [".css", ".scss", ".tsx", ".jsx", ".vue", ".svelte", ".html"],
  check: (line) => {
    const removesOutline =
      line.includes("focus:outline-none") || line.includes("outline: none");
    if (!removesOutline) return null;
    const hasReplacement =
      line.includes("focus:ring") ||
      line.includes("focus-visible") ||
      line.includes("outline-offset");
    return hasReplacement ? null : "";
  },
});

export const name = rule.name;
export default rule.default;
