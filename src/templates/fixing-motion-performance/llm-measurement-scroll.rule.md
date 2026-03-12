---
rule-id: fixing-motion-performance-measurement-scroll
enforcement: llm
---

# Rule: Measurement and Scroll (high)

## What to check
- Measure once, then animate via `transform`/`opacity` (FLIP-style when needed).
- Batch DOM reads before writes; avoid repeated layout reads during motion.
- Prefer `ScrollTimeline`/`ViewTimeline` for scroll-linked effects when available.
- Use `IntersectionObserver` for visibility and pausing off-screen effects.
- Scroll-linked effects must not trigger continuous layout/paint on large surfaces.
