/**
 * Prefer SVG/icon sets over emoji icons in UI.
 */
import { createLineRule } from "../../create-line-rule.js";

const EMOJI = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{26FF}]/u;

const rule = createLineRule({
  name: "Do not use emoji as UI icons",
  extensions: [".tsx", ".jsx", ".vue", ".svelte", ".html"],
  check: (line) => (EMOJI.test(line) ? "" : null),
});

export const name = rule.name;
export default rule.default;
