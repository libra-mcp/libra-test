/**
 * <img> should include alt attribute.
 */
import { createLineRule } from "../../create-line-rule.js";

const rule = createLineRule({
  name: "Images must include alt attribute",
  extensions: [".html", ".htm", ".tsx", ".jsx", ".vue", ".svelte"],
  check: (line) =>
    line.includes("<img") && !line.includes("alt=") ? "" : null,
});

export const name = rule.name;
export default rule.default;
