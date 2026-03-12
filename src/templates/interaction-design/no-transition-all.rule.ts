/**
 * Avoid transition-all / transition: all for performance and predictability.
 */
import { createLineRule } from "../../create-line-rule.js";

const rule = createLineRule({
  name: "Do not use transition-all or transition: all",
  extensions: [".css", ".scss", ".ts", ".tsx", ".js", ".jsx", ".vue", ".html", ".svelte"],
  skipPrefixes: ["src/templates/"],
  check: (line) =>
    line.includes("transition-all") || /transition\s*:\s*all\b/i.test(line) ? "" : null,
});

export const name = rule.name;
export default rule.default;
