---
rule-id: fixing-metadata-correctness-duplication
enforcement: llm
---

# Rule: Correctness and duplication (critical)

## What to check
Define metadata in one place per page; avoid competing systems. Do not emit duplicate title, description, canonical, or robots tags. Metadata must be deterministic (no random or unstable values). Escape and sanitize user-generated or dynamic strings. Every page must have safe defaults for title and description.
