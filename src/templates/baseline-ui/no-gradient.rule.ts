/**
 * Do not use gradients unless explicitly requested. Baseline-ui rule.
 */
import { createLineRule } from "../../create-line-rule.js";

const GRADIENT =
  /\b(?:bg-gradient|from-|to-|via-|gradient-to-|linear-gradient|radial-gradient|conic-gradient)/;

const rule = createLineRule({
  name: "Do not use gradients unless requested",
  extensions: [".tsx", ".jsx", ".vue", ".html", ".svelte", ".css", ".scss"],
  check: (line) => {
    const match = line.match(GRADIENT);
    return match ? match[0] : null;
  },
});

export const name = rule.name;
export default rule.default;
