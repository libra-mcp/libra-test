/**
 * Never use h-screen (use h-dvh). Baseline-ui rule.
 */
import { createLineRule } from "../../create-line-rule.js";

const rule = createLineRule({
  name: "Never use h-screen (use h-dvh)",
  check: (line) => (line.includes("h-screen") ? "" : null),
});

export const name = rule.name;
export default rule.default;
