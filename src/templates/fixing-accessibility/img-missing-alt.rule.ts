/**
 * <img> must include alt attribute (meaningful or empty for decorative).
 * fixing-accessibility: media and motion.
 */
import { createLineRule } from "../../create-line-rule.js";

const rule = createLineRule({
  name: "Images must include alt attribute",
  extensions: [".html", ".htm", ".tsx", ".jsx", ".vue", ".svelte"],
  skipPrefixes: ["src/templates/"],
  check: (line) =>
    line.includes("<img") && !line.includes("alt=") ? "img missing alt" : null,
});

export const name = rule.name;
export default rule.default;
