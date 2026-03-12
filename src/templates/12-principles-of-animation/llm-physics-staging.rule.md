---
rule-id: 12-principles-of-animation-physics-staging
enforcement: llm
---

# Rule: Physics and Staging

## What to check
- `physics-active-state`: interactive controls should have pressed feedback.
- `physics-subtle-deformation`: squash/stretch should stay subtle (~0.95-1.05 scale range).
- `physics-spring-for-overshoot`: use spring dynamics for overshoot-and-settle behavior.
- `physics-no-excessive-stagger`: stagger delays should remain tight (<=50ms/item).
- `staging-one-focal-point`: avoid competing primary animations.
- `staging-dim-background`: modals/dialogs should dim backdrop to direct attention.
- `staging-z-index-hierarchy`: animated overlays must respect a clear layering scale.
