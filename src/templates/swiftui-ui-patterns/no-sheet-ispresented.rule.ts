/**
 * Prefer sheet(item:) over sheet(isPresented:) when possible.
 */
import { createLineRule } from "../../create-line-rule.js";

const rule = createLineRule({
  name: "Avoid sheet(isPresented:) in SwiftUI",
  extensions: [".swift"],
  check: (line) => (line.includes(".sheet(isPresented:") ? "" : null),
});

export const name = rule.name;
export default rule.default;
