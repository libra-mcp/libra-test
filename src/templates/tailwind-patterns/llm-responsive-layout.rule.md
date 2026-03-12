---
rule-id: tailwind-patterns-responsive-layout
enforcement: llm
---

# Rule: Responsive Layout Patterns

## What to check
- Follow mobile-first breakpoints (base, then `sm:`, `md:`, `lg:`...).
- Use consistent container pattern: `max-w-* mx-auto px-4 sm:px-6 lg:px-8`.
- Prevent horizontal overflow at mobile widths.
- Keep spacing on a consistent scale (4, 6, 8, 12, 16, 24).
