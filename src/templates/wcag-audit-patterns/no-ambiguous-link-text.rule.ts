/**
 * Links should avoid ambiguous text like "click here".
 */
import { createLineRule } from "../../create-line-rule.js";

const AMBIGUOUS = />(\s*(click here|read more|learn more)\s*)</i;

const rule = createLineRule({
  name: "Do not use ambiguous link text",
  extensions: [".html", ".htm", ".tsx", ".jsx", ".vue", ".svelte"],
  check: (line) => (AMBIGUOUS.test(line) ? "" : null),
});

export const name = rule.name;
export default rule.default;
