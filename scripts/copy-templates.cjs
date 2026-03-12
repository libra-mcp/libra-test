/**
 * Copy non-TS template assets (.rule.md, .rule.sh) from src/templates to dist/templates
 * so the engine can discover them at runtime. .rule.ts is compiled by tsc to dist.
 */

const fs = require("fs");
const path = require("path");

const srcRoot = path.join(__dirname, "..", "src", "templates");
const distRoot = path.join(__dirname, "..", "dist", "templates");

function cleanNonTsAssets(distDir) {
  if (!fs.existsSync(distDir)) return;
  const entries = fs.readdirSync(distDir, { withFileTypes: true });
  for (const e of entries) {
    const p = path.join(distDir, e.name);
    if (e.isDirectory()) {
      cleanNonTsAssets(p);
    } else if (e.name.endsWith(".rule.md") || e.name.endsWith(".rule.sh")) {
      fs.rmSync(p, { force: true });
    }
  }
}

function copyRecursive(srcDir, distDir) {
  if (!fs.existsSync(srcDir)) return;
  const entries = fs.readdirSync(srcDir, { withFileTypes: true });
  if (!fs.existsSync(distDir)) fs.mkdirSync(distDir, { recursive: true });
  for (const e of entries) {
    const srcPath = path.join(srcDir, e.name);
    const distPath = path.join(distDir, e.name);
    if (e.isDirectory()) {
      copyRecursive(srcPath, distPath);
    } else if (e.name.endsWith(".rule.md") || e.name.endsWith(".rule.sh")) {
      fs.copyFileSync(srcPath, distPath);
    }
  }
}

cleanNonTsAssets(distRoot);
copyRecursive(srcRoot, distRoot);
