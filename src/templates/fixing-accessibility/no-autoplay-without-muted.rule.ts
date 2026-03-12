/**
 * Avoid autoplaying media with sound; use muted with autoplay.
 * fixing-accessibility: media and motion.
 */
import { createLineRule } from "../../create-line-rule.js";

const rule = createLineRule({
  name: "Autoplay media must use muted",
  extensions: [".html", ".htm", ".tsx", ".jsx", ".vue", ".svelte"],
  skipPrefixes: ["src/templates/"],
  check: (line) => {
    const hasAutoplay =
      line.includes("autoplay") || line.includes("autoPlay");
    if (!hasAutoplay) return null;
    const isVideoOrAudio =
      line.includes("<video") || line.includes("<Video") ||
      line.includes("<audio") || line.includes("<Audio");
    if (!isVideoOrAudio) return null;
    const hasMuted = line.includes("muted") || line.includes("muted={");
    return hasMuted ? null : "autoplay without muted";
  },
});

export const name = rule.name;
export default rule.default;
