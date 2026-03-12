/**
 * Avoid animating layout properties that trigger reflow.
 */
import { createLineRule } from "../../create-line-rule.js";

const LAYOUT_PROP =
  /(transition|animation|duration|ease|linear).*(width|height|top|left|right|bottom|margin|padding)/i;

const rule = createLineRule({
  name: "Do not animate layout properties",
  extensions: [".css", ".scss", ".ts", ".tsx", ".js", ".jsx", ".vue", ".svelte", ".html"],
  skipPrefixes: ["src/templates/"],
  check: (line) => (LAYOUT_PROP.test(line) ? "" : null),
});

export const name = rule.name;
export default rule.default;
