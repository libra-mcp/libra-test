#!/usr/bin/env node
/**
 * libra-test CLI — npx @libra-mcp/libra-test [--template <name> ...]
 * With no --template: runs rules from .libra/rules/ in the current repo.
 * With --template: runs built-in template(s).
 */

import chalk from "chalk";
import {
  runTemplates,
  runProjectMode,
  hasLibraRulesDir,
  listTemplates,
} from "./engine.js";
import type { RuleResult } from "./types.js";

const args = process.argv.slice(2);

const HELP_TEXT = `Usage: libra-test [options]

Options:
  --template <name>   Run a built-in template (repeatable)
  --list              List available built-in templates
  --strict            Exit with code 1 when there are warnings (default: only errors fail)
  --json              Output results as JSON
  --help, -h          Show this help message

Examples:
  libra-test                              Run rules from .libra/rules/
  libra-test --template baseline-ui       Run the baseline-ui template
  libra-test --template baseline-ui --strict  Fail on warnings too
  libra-test --template baseline-ui --json  Output as JSON
  libra-test --list                       Show available templates`;

if (args.includes("--help") || args.includes("-h")) {
  console.log(HELP_TEXT);
  process.exit(0);
}

if (args.includes("--list")) {
  const templates = await listTemplates();
  console.log(chalk.cyan.bold("Available templates:\n"));
  for (const t of templates) console.log(chalk.dim("  ") + t);
  process.exit(0);
}

const jsonOutput = args.includes("--json");

const templateFlags = args
  .map((arg, i) => (arg === "--template" ? args[i + 1] : null))
  .filter((v): v is string => v != null && !v.startsWith("-"));

const knownFlags = new Set(["--template", "--json", "--list", "--strict", "--help", "-h", "test"]);
const firstArg = args[0];
if (
  firstArg !== undefined &&
  !firstArg.startsWith("-") &&
  !knownFlags.has(firstArg) &&
  !templateFlags.includes(firstArg)
) {
  console.error(HELP_TEXT);
  process.exit(1);
}

const repoPath = process.cwd();
const projectMode = templateFlags.length === 0;

function formatFailure(
  ruleName: string,
  result: RuleResult,
  icon: "✗" | "⚠",
  style: { icon: (s: string) => string; detail: (s: string) => string }
): string[] {
  const lines: string[] = [];
  lines.push(style.icon(`  ${icon} ${ruleName}`));
  if (result.violations?.length) {
    for (const v of result.violations) {
      const loc = v.line != null ? `${v.file}:${v.line}` : v.file;
      const suffix = v.message ? ` (${v.message})` : "";
      lines.push(style.detail(`    → ${loc}${suffix}`));
    }
  } else {
    lines.push(style.detail(`    → ${result.message}`));
  }
  return lines;
}

const noColor = (s: string) => s;
const styles = {
  pass: { icon: chalk.green, detail: noColor },
  fail: { icon: chalk.red, detail: chalk.dim },
  warn: { icon: chalk.yellow, detail: chalk.dim },
};

async function main(): Promise<number> {
  let aggregated: {
    templateNames: string[];
    staticPassed: number;
    staticFailed: number;
    staticWarned: number;
    llmSkipped: number;
    failures: { templateName: string; ruleName: string; result: RuleResult }[];
    warnings: { templateName: string; ruleName: string; result: RuleResult }[];
    ruleErrors: { templateName: string; ruleId: string; error: string }[];
  };

  if (projectMode) {
    const hasRules = await hasLibraRulesDir(repoPath);
    if (!hasRules) {
      console.error(chalk.red("No .libra/rules/ folder found in this repo."));
      console.error(chalk.dim("  Run with --template baseline-ui to use a built-in template."));
      console.error(chalk.dim("  Or add a .libra/rules/ folder with .rule.js or .rule.sh files."));
      process.exit(1);
    }
    const run = await runProjectMode(repoPath);
    aggregated = {
      templateNames: [run.templateName],
      staticPassed: run.staticPassed,
      staticFailed: run.staticFailed,
      staticWarned: run.staticWarned,
      llmSkipped: run.llmSkipped,
      failures: run.failures.map((f) => ({
        templateName: run.templateName,
        ruleName: f.ruleName,
        result: f.result,
      })),
      warnings: run.warnings.map((w) => ({
        templateName: run.templateName,
        ruleName: w.ruleName,
        result: w.result,
      })),
      ruleErrors: run.ruleErrors.map((e) => ({
        templateName: run.templateName,
        ruleId: e.ruleId,
        error: e.error,
      })),
    };
  } else {
    aggregated = await runTemplates(templateFlags, repoPath);
  }

  if (jsonOutput) {
    console.log(JSON.stringify(aggregated, null, 2));
    return aggregated.staticFailed > 0 ? 1 : 0;
  }

  const title = aggregated.templateNames.join(", ");
  console.log(chalk.cyan.bold(`Libra — ${title}\n`));
  console.log(chalk.green(`✓  ${aggregated.staticPassed} static rules passed`));
  console.log(chalk.red(`✗  ${aggregated.staticFailed} static rules failed`));
  if (aggregated.staticWarned > 0)
    console.log(chalk.yellow(`⚠  ${aggregated.staticWarned} static rules warned`));
  if (aggregated.llmSkipped > 0)
    console.log(
      chalk.dim(`~  ${aggregated.llmSkipped} LLM rules skipped → visit libra-mcp.com to test these`)
    );
  console.log("");

  if (aggregated.ruleErrors.length > 0) {
    console.log(chalk.yellow.bold("Rule errors (broken rules):"));
    for (const e of aggregated.ruleErrors)
      console.log(chalk.yellow(`  ⚠ ${e.templateName}/${e.ruleId}: ${e.error}`));
    console.log("");
  }

  if (aggregated.failures.length > 0) {
    console.log(chalk.red.bold("Failures:"));
    for (const f of aggregated.failures) {
      const lines = formatFailure(f.ruleName, f.result, "✗", styles.fail);
      console.log(lines.join("\n"));
      console.log("");
    }
  }

  if (aggregated.warnings.length > 0) {
    console.log(chalk.yellow.bold("Warnings:"));
    for (const w of aggregated.warnings) {
      const lines = formatFailure(w.ruleName, w.result, "⚠", styles.warn);
      console.log(lines.join("\n"));
      console.log("");
    }
  }

  return aggregated.staticFailed > 0 ? 1 : 0;
}

main()
  .then((code) => process.exit(code))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
