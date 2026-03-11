/**
 * Runner for .rule.ts files in project mode. Invoked as: npx tsx dist/run-rule.js
 * Reads LIBRA_REPO_ROOT and LIBRA_RULE_PATH (file URL) from env, runs the rule, prints JSON.
 */
const repoPath = process.env.LIBRA_REPO_ROOT;
const ruleUrl = process.env.LIBRA_RULE_PATH;
if (!repoPath || !ruleUrl) {
  process.stderr.write("Missing LIBRA_REPO_ROOT or LIBRA_RULE_PATH\n");
  process.exit(1);
}

const mod = await import(ruleUrl);
const check = mod.default;
if (typeof check !== "function") {
  process.stderr.write("Rule has no default export function\n");
  process.exit(1);
}
const result = await check({ repoPath });
const ruleName =
  typeof mod.name === "string"
    ? mod.name
    : new URL(ruleUrl).pathname.split("/").pop()?.replace(/\.rule\.(ts|js)$/, "") ?? "rule";
console.log(JSON.stringify({ result, ruleName }));
