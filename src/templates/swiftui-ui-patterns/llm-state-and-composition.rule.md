---
rule-id: swiftui-ui-patterns-state-composition
enforcement: llm
---

# Rule: SwiftUI State and Composition

## What to check
- Prefer SwiftUI-native state (`@State`, `@Binding`, `@Observable`, `@Environment`).
- Keep state local unless truly shared.
- Build small, focused subviews instead of oversized screens.
- Avoid introducing view models where native state flow is sufficient.
