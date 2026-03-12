/**
 * Avoid linear easing for movement animation.
 */
import { createLineRule } from "../../create-line-rule.js";

const LINEAR_MOTION =
  /(transform|translate|scale|rotate|x\s*:|y\s*:|whileHover|whileTap).*(linear)|linear.*(transform|translate|scale|rotate|x\s*:|y\s*:)/i;

const rule = createLineRule({
  name: "Do not use linear easing for motion",
  extensions: [".css", ".scss", ".ts", ".tsx", ".js", ".jsx", ".vue", ".svelte"],
  skipPrefixes: ["src/templates/"],
  check: (line) => (LINEAR_MOTION.test(line) ? "" : null),
});

export const name = rule.name;
export default rule.default;
