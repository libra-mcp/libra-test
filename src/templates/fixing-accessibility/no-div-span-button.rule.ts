/**
 * Do not use div or span as buttons without full keyboard support.
 * Heuristic: div or span with onClick/onclick without role="button".
 */
import { createLineRule } from "../../create-line-rule.js";

const rule = createLineRule({
  name: "Do not use div/span as button without role and keyboard support",
  extensions: [".tsx", ".jsx", ".vue"],
  check: (line) => {
    const hasDivOrSpan =
      line.includes("<div") || line.includes("<span") ||
      line.includes("<Div") || line.includes("<Span");
    const hasOnClick = line.includes("onClick") || line.includes("onclick");
    const hasRoleButton =
      line.includes('role="button"') ||
      line.includes("role={'button'}") ||
      line.includes("role='button'");
    return hasDivOrSpan && hasOnClick && !hasRoleButton ? "" : null;
  },
});

export const name = rule.name;
export default rule.default;
