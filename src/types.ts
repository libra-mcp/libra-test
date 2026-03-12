/**
 * Rule engine types — aligned with docs/specs/rules-enforcement.md and cli-test-runner.md
 */

export interface RuleContext {
  /** Absolute path to repo root (cwd when user runs the CLI). */
  repoPath: string;
  /** Unified diff string (available in GitHub App context; omit for template runs). */
  prDiff?: string;
  /** List of changed file paths. */
  changedFiles?: string[];
}

export interface Violation {
  /** Path relative to repo root. */
  file: string;
  /** One-based line number. */
  line?: number;
  /** Optional override per location (e.g. "(z-[999])"). */
  message?: string;
}

/** Severity of a failed rule. "warn" = report but do not fail exit code (e.g. "unless requested" rules). */
export type RuleSeverity = "error" | "warn";

export interface RuleResult {
  pass: boolean;
  /** Rule-level message (e.g. "Never use h-screen (use h-dvh)"). */
  message: string;
  /** Optional extended explanation. */
  details?: string;
  /** When present, output "→ file:line" per entry. */
  violations?: Violation[];
  /** When pass is false: "error" (default) fails the run; "warn" only reports. */
  severity?: RuleSeverity;
}

/** Static rule check function exported by .rule.ts files. */
export type RuleCheck = (context: RuleContext) => Promise<RuleResult>;
