#!/usr/bin/env node
/**
 * libra-test CLI — npx @libra-mcp/libra-test [--template <name> ...]
 * With no --template: runs rules from .libra/rules/ in the current repo.
 * With --template: runs built-in template(s).
 */

import { runTemplates, runProjectMode, hasLibraRulesDir } from "./engine.js";
import type { RuleResult } from "./types.js";

const args = process.argv.slice(2);
const templateFlags = args
  .map((arg, i) => (arg === "--template" ? args[i + 1] : null))
  .filter((v): v is string => v != null && !v.startsWith("-"));

const firstArg = args[0];
if (firstArg !== undefined && !firstArg.startsWith("-") && firstArg !== "test") {
  console.error("Usage: libra-test [--template <name> ...]");
  console.error("  No --template: run rules from .libra/rules/ in the current repo.");
  console.error("  With --template: run built-in template (e.g. --template baseline-ui).");
  process.exit(1);
}

const repoPath = process.cwd();
const projectMode = templateFlags.length === 0;

function formatFailure(ruleName: string, result: RuleResult): string[] {
  const lines: string[] = [];
  lines.push(`  ✗ ${ruleName}`);
  if (result.violations?.length) {
    for (const v of result.violations) {
      const loc = v.line != null ? `${v.file}:${v.line}` : v.file;
      const suffix = v.message ? ` (${v.message})` : "";
      lines.push(`    → ${loc}${suffix}`);
    }
  } else {
    lines.push(`    → ${result.message}`);
  }
  return lines;
}

async function main(): Promise<number> {
  let aggregated: {
    templateNames: string[];
    staticPassed: number;
    staticFailed: number;
    llmSkipped: number;
    failures: { templateName: string; ruleName: string; result: RuleResult }[];
    ruleErrors: { templateName: string; ruleId: string; error: string }[];
  };

  if (projectMode) {
    const hasRules = await hasLibraRulesDir(repoPath);
    if (!hasRules) {
      console.error("No .libra/rules/ folder found in this repo.");
      console.error("  Run with --template baseline-ui to use a built-in template.");
      console.error("  Or add a .libra/rules/ folder with .rule.js or .rule.sh files.");
      process.exit(1);
    }
    const run = await runProjectMode(repoPath);
    aggregated = {
      templateNames: [run.templateName],
      staticPassed: run.staticPassed,
      staticFailed: run.staticFailed,
      llmSkipped: run.llmSkipped,
      failures: run.failures.map((f) => ({
        templateName: run.templateName,
        ruleName: f.ruleName,
        result: f.result,
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

  const title = aggregated.templateNames.join(", ");
  console.log(`Libra — ${title}\n`);
  console.log(`✓  ${aggregated.staticPassed} static rules passed`);
  console.log(`✗  ${aggregated.staticFailed} static rules failed`);
  if (aggregated.llmSkipped > 0)
    console.log(`~  ${aggregated.llmSkipped} LLM rules skipped → visit libra-mcp.com to test these`);
  console.log("");

  if (aggregated.ruleErrors.length > 0) {
    console.log("Rule errors (broken rules):");
    for (const e of aggregated.ruleErrors)
      console.log(`  ⚠ ${e.templateName}/${e.ruleId}: ${e.error}`);
    console.log("");
  }

  if (aggregated.failures.length > 0) {
    console.log("Failures:");
    for (const f of aggregated.failures) {
      const lines = formatFailure(f.ruleName, f.result);
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
