---
rule-id: interaction-design-animation-accessibility
enforcement: llm
---

# Rule: Animation Accessibility and Performance

## What to check
- Respect `prefers-reduced-motion` for non-essential motion.
- Prefer `transform` and `opacity` to avoid jank.
- Avoid blocking user input while animations are running.
- Ensure interactions still work when JS animation is unavailable.
