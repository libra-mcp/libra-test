/**
 * Stagger delay should be subtle (<= 0.05s per item).
 */
import { createLineRule } from "../../create-line-rule.js";

const STAGGER = /staggerChildren\s*:\s*(\d+(?:\.\d+)?)/;

const rule = createLineRule({
  name: "Do not use excessive staggerChildren delay",
  extensions: [".ts", ".tsx", ".js", ".jsx", ".vue", ".svelte"],
  check: (line) => {
    const match = line.match(STAGGER);
    if (!match) return null;
    const value = Number(match[1]);
    if (Number.isNaN(value) || value <= 0.05) return null;
    return `${value}s`;
  },
});

export const name = rule.name;
export default rule.default;
