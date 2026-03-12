/**
 * Avoid will-change on layout-triggering properties; prefer transform/opacity.
 */
import { createLineRule } from "../../create-line-rule.js";

const WILL_LAYOUT =
  /will-change\s*:\s*[^;}\s]*(?:width|height|left|right|top|bottom|margin|padding)/i;

const rule = createLineRule({
  name: "Do not use will-change for layout properties",
  extensions: [".css", ".scss", ".ts", ".tsx", ".js", ".jsx", ".vue", ".svelte"],
  skipPrefixes: ["src/templates/"],
  check: (line) => (WILL_LAYOUT.test(line) ? "" : null),
});

export const name = rule.name;
export default rule.default;
