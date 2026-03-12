/**
 * Icon-only buttons must have aria-label. fixing-accessibility rule.
 * Only flags buttons that contain an icon (svg, Icon component) and lack aria-label/aria-labelledby.
 */
import { createLineRule } from "../../create-line-rule.js";

const BUTTON_OPEN = /<(?:\s*)(?:button|Button)\b/;
const BUTTON_CLOSE = /<\/(?:\s*)(?:button|Button)\s*>/;
/** Patterns that suggest the button content is or includes an icon. */
const ICON_IN_BODY =
  /<svg\b|<Icon\b|<\/svg>|<path\s|Icon[A-Z]\w*\s*\/|@tabler\/icons|@heroicons|LucideIcon|HeroIcon|FeatherIcon|Feather\b/;
/** Text content between tags or after /> (e.g. "Copy", "Sign out") — not icon-only. */
const HAS_VISIBLE_TEXT = /(\/>|>)\s*[A-Za-z][A-Za-z\s]{1,30}\s*</;

function getButtonBody(lineIndex: number, lines: string[]): string {
  let body = "";
  for (let i = lineIndex; i < Math.min(lineIndex + 40, lines.length); i++) {
    body += lines[i] + " ";
    if (BUTTON_CLOSE.test(lines[i])) break;
  }
  return body;
}

function iconOnlyButtonWithoutLabel(
  line: string,
  lineIndex: number,
  lines: string[] | undefined
): string | null {
  if (!BUTTON_OPEN.test(line)) return null;
  if (/aria-label\s*=|aria-labelledby\s*=/.test(line)) return null;
  if (lines === undefined) return "icon-only button should have aria-label";
  const body = getButtonBody(lineIndex, lines);
  if (!ICON_IN_BODY.test(body)) return null;
  if (HAS_VISIBLE_TEXT.test(body)) return null;
  if (/aria-label\s*=|aria-labelledby\s*=/.test(body)) return null;
  return "icon-only button should have aria-label";
}

const rule = createLineRule({
  name: "Icon-only buttons must have aria-label",
  extensions: [".tsx", ".jsx", ".vue"],
  skipPrefixes: ["src/templates/"],
  check: (line, lineIndex, lines) => iconOnlyButtonWithoutLabel(line, lineIndex, lines),
});

export const name = rule.name;
export default rule.default;
