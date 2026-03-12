---
rule-id: tailwind-patterns-dark-mode-performance
enforcement: llm
---

# Rule: Dark Mode and Motion Performance

## What to check
- Prefer semantic tokens (`bg-card`, `text-foreground`, `border-border`) over raw color utilities.
- Avoid redundant/manual dark variants when token system already handles themes.
- Prefer transform/opacity transitions over layout-triggering animation.
- Keep z-index layering systematic and predictable.
