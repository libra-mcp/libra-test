---
rule-id: fixing-accessibility-semantics
enforcement: llm
---

# Rule: Semantics (high)

## What to check
Prefer native elements (button, a, input) over role-based hacks. If a role is used, required aria attributes must be present. Lists must use ul/ol with li. Do not skip heading levels. Tables must use th for headers when applicable.
