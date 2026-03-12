---
rule-id: swiftui-ui-patterns-sheet-patterns
enforcement: llm
---

# Rule: Sheet Patterns

## What to check
- Prefer `.sheet(item:)` when sheet state is selected model/item driven.
- Avoid `if let` branching inside the sheet body.
- Sheet views should own save/cancel actions and call `dismiss()` internally.
- Keep async save flows explicit (loading state + task + dismiss on success).
