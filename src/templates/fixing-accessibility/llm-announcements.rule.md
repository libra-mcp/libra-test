---
rule-id: fixing-accessibility-announcements
enforcement: llm
---

# Rule: Announcements (medium-high)

## What to check
Critical form errors should use aria-live. Loading states should use aria-busy or status text. Toasts must not be the only way to convey critical information. Expandable controls must use aria-expanded and aria-controls.
