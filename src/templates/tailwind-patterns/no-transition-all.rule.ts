/**
 * Avoid transition-all for performance and predictability.
 */
import { createLineRule } from "../../create-line-rule.js";

const rule = createLineRule({
  name: "Do not use transition-all",
  extensions: [".tsx", ".jsx", ".vue", ".html", ".svelte"],
  check: (line) => (line.includes("transition-all") ? "" : null),
});

export const name = rule.name;
export default rule.default;
