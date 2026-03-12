---
rule-id: fixing-accessibility-keyboard-access
enforcement: llm
---

# Rule: Keyboard access (critical)

## What to check
All interactive elements must be reachable by Tab. Focus must be visible. Do not use tabindex > 0. Escape must close dialogs or overlays when applicable. Do not use div/span as buttons without full keyboard support.
