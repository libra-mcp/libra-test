/**
 * Do not modify letter-spacing (tracking-*) unless explicitly requested. Baseline-ui rule.
 */
import { createLineRule } from "../../create-line-rule.js";

const TRACKING = /\btracking-(?:tighter|tight|normal|wide|wider|widest)\b/;

const rule = createLineRule({
  name: "Do not use tracking-* (letter-spacing) unless requested",
  severity: "warn",
  extensions: [".tsx", ".jsx", ".vue", ".html", ".svelte", ".css", ".scss"],
  check: (line) => {
    const match = line.match(TRACKING);
    return match ? match[0] : null;
  },
});

export const name = rule.name;
export default rule.default;
