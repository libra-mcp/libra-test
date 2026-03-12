---
rule-id: swiftui-ui-patterns-navigation-scaffolding
enforcement: llm
---

# Rule: Navigation and App Scaffolding

## What to check
- Use `TabView` + `NavigationStack` + sheets as the base architecture when app structure needs tabs/routes.
- Start minimal (`AppTab`, `RouterPath`) and expand enums as screens grow.
- Reuse local project conventions from nearby SwiftUI screens before introducing new patterns.
