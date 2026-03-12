---
rule-id: 12-principles-of-animation-easing
enforcement: llm
---

# Rule: Easing

## What to check
- `easing-entrance-ease-out`: entrances should use ease-out curves.
- `easing-exit-ease-in`: exits should use ease-in curves.
- `easing-no-linear-motion`: avoid linear easing for UI movement (except progress indicators).
- `easing-natural-decay`: prefer natural/exponential decay over linear ramps for decay-style effects.
