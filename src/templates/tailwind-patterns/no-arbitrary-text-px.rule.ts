/**
 * Avoid arbitrary px text sizes; prefer Tailwind text scale.
 */
import { createLineRule } from "../../create-line-rule.js";

const TEXT_PX = /text-\[\d+px\]/;

const rule = createLineRule({
  name: "Do not use arbitrary text-[Npx] classes",
  extensions: [".tsx", ".jsx", ".vue", ".html", ".svelte"],
  check: (line) => {
    const match = line.match(TEXT_PX);
    return match ? match[0] : null;
  },
});

export const name = rule.name;
export default rule.default;
