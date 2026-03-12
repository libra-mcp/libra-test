/**
 * Do not use tabindex greater than 0.
 * Positive tabindex breaks logical tab order.
 */
import { createLineRule } from "../../create-line-rule.js";

const TABINDEX_POSITIVE =
  /tabindex\s*=\s*[\{'"]([1-9]\d*)[\}'"]|tabIndex\s*=\s*[\{'"]([1-9]\d*)[\}'"]/;

const rule = createLineRule({
  name: "Do not use tabindex greater than 0",
  check: (line) => {
    const match = line.match(TABINDEX_POSITIVE);
    if (!match) return null;
    const value = match[1] ?? match[2];
    return `tabindex=${value}`;
  },
});

export const name = rule.name;
export default rule.default;
