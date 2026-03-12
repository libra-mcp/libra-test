---
rule-id: fixing-motion-performance-paint-layers-blur
enforcement: llm
---

# Rule: Paint, Layers, and Blur (medium)

## What to check
- Paint-heavy animation is allowed only on small, isolated elements.
- Do not animate inherited CSS variables for transform/opacity/position.
- Use `will-change` temporarily and surgically; avoid over-promoting layers.
- Keep blur animation small (<=8px), short-lived, and never continuous.
- Prefer opacity/translate over blur for repeated interactions.
