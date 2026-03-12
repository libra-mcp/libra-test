/**
 * Avoid scroll event driven animation mutations.
 */
import { createLineRule } from "../../create-line-rule.js";

const rule = createLineRule({
  name: "Do not drive animation from scroll event handlers",
  extensions: [".ts", ".tsx", ".js", ".jsx", ".vue", ".svelte"],
  check: (line) => {
    const hasScrollListener =
      line.includes('addEventListener("scroll"') ||
      line.includes("addEventListener('scroll'") ||
      line.includes("onscroll");
    const mutatesVisualState =
      line.includes(".style.") ||
      line.includes("setProperty(") ||
      line.includes("animate(") ||
      line.includes("scrollY");
    return hasScrollListener && mutatesVisualState ? "" : null;
  },
});

export const name = rule.name;
export default rule.default;
