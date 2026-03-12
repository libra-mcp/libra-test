# libra-test

Run static rules against your codebase based on your Cursor and Claude rules.

## Usage

**Run rules from your repo’s `.libra/rules/`** — runs every `.rule.js`, `.rule.ts`, and `.rule.sh` in that folder:

```bash
npx @libra-mcp/libra-test
```

**Or use a built-in template** (no setup):

```bash
npx @libra-mcp/libra-test --template baseline-ui
```

Multiple templates:

```bash
npx @libra-mcp/libra-test --template baseline-ui --template fixing-accessibility --template fixing-metadata
```

## What it does

- **Project mode** (no `--template`): Looks for a `.libra/rules/` folder in the current directory. If present, runs every `.rule.js`, `.rule.ts`, and `.rule.sh` in it (`.rule.ts` is run via tsx); `.rule.md` files are counted as LLM rules (skipped in CLI). If the folder is missing, you’ll get a short message and exit code.
- **Template mode** (`--template <name>`): Runs predefined static rules from a built-in template (e.g. `baseline-ui`) against the current working directory.
- **Output:** File-specific violations with paths and line numbers. LLM rules are counted and skipped with a pointer to libra-mcp.com.
- **Exit code:** Non-zero if any static rule failed.

## Templates

- **baseline-ui** — Opinionated UI baseline (Tailwind, accessibility, layout). From [ui-skills baseline-ui](https://www.ui-skills.com/skills/baseline-ui). Includes 3 static rules (h-dvh, icon button aria-label, no arbitrary z-index) and 8 LLM rules (skipped in CLI; run via GitHub App).
- **12-principles-of-animation** — Audit animation quality using Disney's 12 principles adapted for web (timing, easing, physics, staging), with `file:line` findings format. Includes 3 static rules and 3 LLM rules.
- **fixing-accessibility** — Audit and fix HTML accessibility (ARIA labels, keyboard, focus, forms, contrast, motion). Includes 3 static rules (icon-button aria-label, no div/span as button, no tabindex > 0) and 9 LLM rules.
- **interaction-design** — Design and implement microinteractions, transitions, loading states, gesture interactions, and feedback patterns with accessibility and performance guidance. Includes 2 static rules and 3 LLM rules.
- **fixing-metadata** — Audit and fix HTML/SEO metadata (titles, descriptions, canonical, OG, Twitter cards, favicons, JSON-LD). Includes 2 static rules (no duplicate title, html has lang) and 8 LLM rules.
- **fixing-motion-performance** — Audit and fix animation performance issues (layout thrashing, compositor properties, scroll-linked motion, blur/filter usage, and tool boundaries). Includes 2 static rules and 4 LLM rules.
- **swiftui-ui-patterns** — Best practices and examples for SwiftUI view composition, state ownership, environment injection, TabView/NavigationStack wiring, and sheet patterns. Includes 2 static rules and 3 LLM rules.
- **tailwind-patterns** — Production-ready Tailwind CSS component patterns for layouts, cards, navigation, forms, buttons, typography, responsive behavior, dark mode, and correction rules for common mistakes. Includes 3 static rules and 3 LLM rules.
- **ui-ux-pro-max** — Comprehensive UI/UX design intelligence for accessibility, interaction, performance, responsive layout, typography/color, animation, style selection, and chart guidance with stack/domain search workflows. Includes 1 static rule and 4 LLM rules.
- **wcag-audit-patterns** — WCAG 2.2 accessibility audit checklist and remediation guidance across POUR principles, automated testing, and common fix patterns. Includes 3 static rules and 4 LLM rules.
