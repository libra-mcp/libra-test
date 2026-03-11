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
npx @libra-mcp/libra-test --template baseline-ui --template fixing-accessibility
```

## What it does

- **Project mode** (no `--template`): Looks for a `.libra/rules/` folder in the current directory. If present, runs every `.rule.js`, `.rule.ts`, and `.rule.sh` in it (`.rule.ts` is run via tsx); `.rule.md` files are counted as LLM rules (skipped in CLI). If the folder is missing, you’ll get a short message and exit code.
- **Template mode** (`--template <name>`): Runs predefined static rules from a built-in template (e.g. `baseline-ui`) against the current working directory.
- **Output:** File-specific violations with paths and line numbers. LLM rules are counted and skipped with a pointer to libra-mcp.com.
- **Exit code:** Non-zero if any static rule failed.

## Templates

- **baseline-ui** — Opinionated UI baseline (Tailwind, accessibility, layout). From [ui-skills baseline-ui](https://www.ui-skills.com/skills/baseline-ui). Includes 3 static rules (h-dvh, icon button aria-label, no arbitrary z-index) and 8 LLM rules (skipped in CLI; run via GitHub App).
