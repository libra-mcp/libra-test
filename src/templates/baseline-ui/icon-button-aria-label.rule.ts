/**
 * Icon-only buttons must have aria-label. Baseline-ui rule.
 */
import { createLineRule } from "../../create-line-rule.js";

const rule = createLineRule({
  name: "Icon-only buttons must have aria-label",
  extensions: [".tsx", ".jsx", ".vue"],
  check: (line) =>
    (line.includes("<button") || line.includes("<Button")) && !line.includes("aria-label")
      ? ""
      : null,
});

export const name = rule.name;
export default rule.default;
