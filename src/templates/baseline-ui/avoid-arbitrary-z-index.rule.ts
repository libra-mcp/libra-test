/**
 * Avoid arbitrary z-index values (e.g. z-[999]). Baseline-ui rule.
 */
import { createLineRule } from "../../create-line-rule.js";

const Z_ARBITRARY = /z-\[\d+\]/;

const rule = createLineRule({
  name: "Avoid arbitrary z-index values",
  check: (line) => {
    const match = line.match(Z_ARBITRARY);
    return match ? match[0] : null;
  },
});

export const name = rule.name;
export default rule.default;
