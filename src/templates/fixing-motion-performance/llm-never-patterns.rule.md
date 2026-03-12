---
rule-id: fixing-motion-performance-never-patterns
enforcement: llm
---

# Rule: Never Patterns (critical)

## What to check
- Do not interleave layout reads and writes in the same frame.
- Do not animate layout continuously on large or meaningful surfaces.
- Do not drive animation from `scrollTop`, `scrollY`, or raw `scroll` event polling.
- No `requestAnimationFrame` loops without an explicit stop condition.
- Do not mix multiple animation systems that both measure or mutate layout.
