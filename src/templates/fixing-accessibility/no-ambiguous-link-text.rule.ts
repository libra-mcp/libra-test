/**
 * Links must have meaningful text; avoid "click here", "read more", "learn more".
 * fixing-accessibility: accessible names.
 */
import { createLineRule } from "../../create-line-rule.js";

const AMBIGUOUS = />(\s*(click here|read more|learn more)\s*)</i;

const rule = createLineRule({
  name: "Do not use ambiguous link text",
  extensions: [".html", ".htm", ".tsx", ".jsx", ".vue", ".svelte"],
  skipPrefixes: ["src/templates/"],
  check: (line) => (AMBIGUOUS.test(line) ? "ambiguous link text" : null),
});

export const name = rule.name;
export default rule.default;
