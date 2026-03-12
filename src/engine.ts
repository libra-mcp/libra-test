/**
 * Rule engine: discover and run static rules from template folders or .libra/rules/.
 * LLM (.rule.md) rules are counted and skipped with a teaser message.
 */

import { spawn } from "child_process";
import { readdir, stat } from "fs/promises";
import { pathToFileURL } from "url";
import path from "path";
import { fileURLToPath } from "url";
import type { RuleContext, RuleResult } from "./types.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export interface RunResult {
  templateName: string;
  staticPassed: number;
  staticFailed: number;
  llmSkipped: number;
  failures: { ruleName: string; result: RuleResult }[];
  ruleErrors: { ruleId: string; error: string }[];
}

export interface AggregatedResult {
  templateNames: string[];
  staticPassed: number;
  staticFailed: number;
  llmSkipped: number;
  failures: { templateName: string; ruleName: string; result: RuleResult }[];
  ruleErrors: { templateName: string; ruleId: string; error: string }[];
}

/**
 * Resolve the directory containing compiled templates (dist/templates).
 * Engine runs from dist/engine.js, so __dirname is dist.
 */
function getTemplatesDir(): string {
  return path.join(__dirname, "templates");
}

/**
 * List available built-in template names.
 */
export async function listTemplates(): Promise<string[]> {
  const templatesDir = getTemplatesDir();
  const entries = await readdir(templatesDir, { withFileTypes: true });
  return entries
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort();
}

const RULES_DIR = ".libra/rules";

/**
 * Return true if .libra/rules/ exists as a directory.
 */
export async function hasLibraRulesDir(repoPath: string): Promise<boolean> {
  try {
    const dir = path.join(repoPath, RULES_DIR);
    const s = await stat(dir);
    return s.isDirectory();
  } catch {
    return false;
  }
}

/**
 * Run static rules from the repo's .libra/rules/ (project mode).
 * Discovers all .rule.js, .rule.ts, and .rule.sh in that folder and runs them; .rule.md count as LLM skipped.
 * .rule.ts files are run via a tsx subprocess so they execute without precompiling.
 */
export async function runProjectMode(repoPath: string): Promise<RunResult> {
  const result: RunResult = {
    templateName: ".libra/rules",
    staticPassed: 0,
    staticFailed: 0,
    llmSkipped: 0,
    failures: [],
    ruleErrors: [],
  };

  const rulesDir = path.join(repoPath, RULES_DIR);
  let entries;
  try {
    entries = await readdir(rulesDir, { withFileTypes: true });
  } catch {
    return result;
  }

  const staticJs: string[] = [];
  const staticTs: string[] = [];
  const staticSh: string[] = [];
  let llmMd = 0;
  for (const e of entries) {
    if (!e.isFile()) continue;
    if (e.name.endsWith(".rule.js")) staticJs.push(e.name);
    else if (e.name.endsWith(".rule.ts")) staticTs.push(e.name);
    else if (e.name.endsWith(".rule.sh")) staticSh.push(e.name);
    else if (e.name.endsWith(".rule.md")) llmMd++;
  }
  result.llmSkipped = llmMd;

  const context: RuleContext = { repoPath };

  for (const f of staticJs) {
    const rulePath = path.join(rulesDir, f);
    try {
      const { result: runResult, ruleName } = await runRuleTs(rulePath, context);
      if (runResult.pass) result.staticPassed++;
      else {
        result.staticFailed++;
        result.failures.push({ ruleName, result: runResult });
      }
    } catch (err) {
      result.staticFailed++;
      result.ruleErrors.push({
        ruleId: ruleIdFromFilename(f),
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  const runRulePath = path.join(__dirname, "run-rule.js");
  for (const f of staticTs) {
    const rulePath = path.join(rulesDir, f);
    try {
      const { result: runResult, ruleName } = await runRuleTsViaTsx(
        rulePath,
        context,
        runRulePath
      );
      if (runResult.pass) result.staticPassed++;
      else {
        result.staticFailed++;
        result.failures.push({ ruleName, result: runResult });
      }
    } catch (err) {
      result.staticFailed++;
      result.ruleErrors.push({
        ruleId: ruleIdFromFilename(f),
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  for (const f of staticSh) {
    const rulePath = path.join(rulesDir, f);
    try {
      const { result: runResult, ruleName } = await runRuleSh(rulePath, context);
      if (runResult.pass) result.staticPassed++;
      else {
        result.staticFailed++;
        result.failures.push({ ruleName, result: runResult });
      }
    } catch (err) {
      result.staticFailed++;
      result.ruleErrors.push({
        ruleId: ruleIdFromFilename(f),
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return result;
}

/**
 * List rule files in a template directory. Returns base names only; caller joins with templateDir.
 */
async function listRuleFiles(templateDir: string): Promise<{
  staticTs: string[];
  staticSh: string[];
  llmMd: string[];
}> {
  const entries = await readdir(templateDir, { withFileTypes: true });
  const staticTs: string[] = [];
  const staticSh: string[] = [];
  const llmMd: string[] = [];
  for (const e of entries) {
    if (!e.isFile()) continue;
    if (e.name.endsWith(".rule.ts") || e.name.endsWith(".rule.js"))
      staticTs.push(e.name);
    else if (e.name.endsWith(".rule.sh")) staticSh.push(e.name);
    else if (e.name.endsWith(".rule.md")) llmMd.push(e.name);
  }
  return { staticTs, staticSh, llmMd };
}

/**
 * Derive a short rule name from filename (e.g. never-h-screen.rule.ts → "never-h-screen").
 * .rule.ts modules can export `export const name = "..."` for display; we'll use that when present.
 */
function ruleIdFromFilename(filename: string): string {
  return filename.replace(/\.rule\.(ts|js|sh|md)$/, "");
}

/**
 * Run a single .rule.ts / .rule.js module.
 */
async function runRuleTs(
  rulePath: string,
  context: RuleContext
): Promise<{ result: RuleResult; ruleName: string }> {
  const url = pathToFileURL(rulePath).href;
  const mod = await import(url);
  const check = mod.default;
  if (typeof check !== "function")
    throw new Error(`Rule ${rulePath} has no default export function`);
  const result = await check(context);
  const ruleName =
    typeof mod.name === "string" ? mod.name : ruleIdFromFilename(path.basename(rulePath));
  return { result, ruleName };
}

/**
 * Run a single .rule.sh script.
 */
function runRuleSh(
  rulePath: string,
  context: RuleContext
): Promise<{ result: RuleResult; ruleName: string }> {
  return new Promise((resolve) => {
    const child = spawn("sh", [rulePath], {
      cwd: context.repoPath,
      env: {
        ...process.env,
        LIBRA_REPO_ROOT: context.repoPath,
      },
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    child.stdout?.on("data", (chunk) => (stdout += chunk));
    child.stderr?.on("data", (chunk) => (stderr += chunk));
    child.on("close", (code) => {
      const ruleName = ruleIdFromFilename(path.basename(rulePath));
      const message = (stdout || stderr).trim() || "Rule failed";
      resolve({
        ruleName,
        result: {
          pass: code === 0,
          message,
        },
      });
    });
    child.on("error", (err) => {
      resolve({
        ruleName: ruleIdFromFilename(path.basename(rulePath)),
        result: { pass: false, message: err.message },
      });
    });
  });
}

/**
 * Run a .rule.ts file via tsx subprocess (Node cannot import .ts without a loader).
 */
function runRuleTsViaTsx(
  rulePath: string,
  context: RuleContext,
  runRulePath: string
): Promise<{ result: RuleResult; ruleName: string }> {
  return new Promise((resolve, reject) => {
    const ruleUrl = pathToFileURL(rulePath).href;
    const packageRoot = path.join(__dirname, "..");
    const child = spawn(
      "npx",
      ["tsx", runRulePath],
      {
        cwd: packageRoot,
        env: {
          ...process.env,
          LIBRA_REPO_ROOT: context.repoPath,
          LIBRA_RULE_PATH: ruleUrl,
        },
        stdio: ["ignore", "pipe", "pipe"],
      }
    );
    let stdout = "";
    let stderr = "";
    child.stdout?.on("data", (chunk) => (stdout += chunk));
    child.stderr?.on("data", (chunk) => (stderr += chunk));
    child.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(stderr.trim() || `Runner exited ${code}`));
        return;
      }
      try {
        const data = JSON.parse(stdout.trim()) as { result: RuleResult; ruleName: string };
        resolve({ result: data.result, ruleName: data.ruleName });
      } catch {
        reject(new Error("Runner did not output valid JSON"));
      }
    });
    child.on("error", (err) => reject(err));
  });
}

/**
 * Run one template (e.g. baseline-ui) and return counts + failures.
 */
export async function runTemplate(
  templateName: string,
  repoPath: string
): Promise<RunResult> {
  const templatesDir = getTemplatesDir();
  const templateDir = path.join(templatesDir, templateName);
  const { staticTs, staticSh, llmMd } = await listRuleFiles(templateDir);

  const context: RuleContext = { repoPath };
  const failures: { ruleName: string; result: RuleResult }[] = [];
  const ruleErrors: { ruleId: string; error: string }[] = [];
  let staticPassed = 0;
  let staticFailed = 0;

  for (const f of staticTs) {
    const rulePath = path.join(templateDir, f);
    try {
      const { result, ruleName } = await runRuleTs(rulePath, context);
      if (result.pass) staticPassed++;
      else {
        staticFailed++;
        failures.push({ ruleName, result });
      }
    } catch (err) {
      staticFailed++;
      ruleErrors.push({
        ruleId: ruleIdFromFilename(f),
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  for (const f of staticSh) {
    const rulePath = path.join(templateDir, f);
    try {
      const { result, ruleName } = await runRuleSh(rulePath, context);
      if (result.pass) staticPassed++;
      else {
        staticFailed++;
        failures.push({ ruleName, result });
      }
    } catch (err) {
      staticFailed++;
      ruleErrors.push({
        ruleId: ruleIdFromFilename(f),
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return {
    templateName,
    staticPassed,
    staticFailed,
    llmSkipped: llmMd.length,
    failures,
    ruleErrors,
  };
}

/**
 * Run multiple templates and aggregate results.
 */
export async function runTemplates(
  templateNames: string[],
  repoPath: string
): Promise<AggregatedResult> {
  const aggregated: AggregatedResult = {
    templateNames,
    staticPassed: 0,
    staticFailed: 0,
    llmSkipped: 0,
    failures: [],
    ruleErrors: [],
  };

  for (const name of templateNames) {
    const run = await runTemplate(name, repoPath);
    aggregated.staticPassed += run.staticPassed;
    aggregated.staticFailed += run.staticFailed;
    aggregated.llmSkipped += run.llmSkipped;
    for (const f of run.failures)
      aggregated.failures.push({ templateName: name, ruleName: f.ruleName, result: f.result });
    for (const e of run.ruleErrors)
      aggregated.ruleErrors.push({ templateName: name, ruleId: e.ruleId, error: e.error });
  }

  return aggregated;
}
