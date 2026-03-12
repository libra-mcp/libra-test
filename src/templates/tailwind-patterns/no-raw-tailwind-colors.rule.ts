/**
 * Prefer semantic color tokens over raw palette utilities.
 */
import { createLineRule } from "../../create-line-rule.js";

const RAW_COLOR =
  /\b(?:bg|text|border|from|to|via)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}\b/g;

const rule = createLineRule({
  name: "Do not use raw Tailwind color classes",
  extensions: [".tsx", ".jsx", ".vue", ".html", ".svelte"],
  check: (line) => {
    const matches = [...line.matchAll(RAW_COLOR)].map((m) => m[0]);
    return matches.length > 0 ? matches : null;
  },
});

export const name = rule.name;
export default rule.default;
