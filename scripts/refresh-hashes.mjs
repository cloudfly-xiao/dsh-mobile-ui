#!/usr/bin/env node
/**
 * refresh-hashes.mjs — one-shot codemod for dsh-mobile-ui after a dsh upgrade.
 *
 * The plugin CSS/JS references content-hashed classes from dsh-client-ui-*
 * builds (e.g. .uV2eYG_card, .o3BgMG_inspectButton). After upgrading dsh those
 * hashes change and the rules silently stop matching. This script reads the
 * class-name maps ({ "logical": "hash_logical" }) from the INSTALLED bundles
 * and rewrites lib/client.js token-by-token.
 *
 * Safety rules:
 *   - a token whose old form still exists in the build is left untouched;
 *   - a dead token is auto-rewritten only when the logical name has exactly
 *     ONE distinct class in the new build (cross-package collisions such as
 *     "root"/"card" are common, so ambiguity is reported, never guessed);
 *   - nothing is written without --write; the report always prints first.
 *
 * Usage:
 *   node scripts/refresh-hashes.mjs            # dry-run report
 *   node scripts/refresh-hashes.mjs --write    # apply
 * Env:
 *   DSH_PKGS_DIR   explicit @deepseek-ai dir (default: auto-discover ~/.npm/_npx)
 */
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const TARGET = path.join(ROOT, "lib", "client.js");
const WRITE = process.argv.includes("--write");

function discoverDshPkgs() {
  if (process.env.DSH_PKGS_DIR) return process.env.DSH_PKGS_DIR;
  const npx = path.join(os.homedir(), ".npm", "_npx");
  try {
    for (const ent of fs.readdirSync(npx).sort()) {
      const cand = path.join(npx, ent, "node_modules", "@deepseek-ai");
      if (fs.existsSync(path.join(cand, "dsh-client-ui-layout", "lib", "client.js"))) return cand;
    }
  } catch { /* fallthrough */ }
  return null;
}

const pkgsDir = discoverDshPkgs();
if (!pkgsDir) {
  console.error("refresh-hashes: no @deepseek-ai client bundles found; set DSH_PKGS_DIR");
  process.exit(1);
}

// logical name -> Set(full classes), from every client bundle's class maps
const logicalToClasses = new Map();
let bundles = "";
let mapEntries = 0;
for (const d of fs.readdirSync(pkgsDir)) {
  if (!d.startsWith("dsh-client-ui-")) continue;
  const f = path.join(pkgsDir, d, "lib", "client.js");
  let src;
  try { src = fs.readFileSync(f, "utf8"); } catch { continue; }
  bundles += src;
  for (const m of src.matchAll(/"([A-Za-z][A-Za-z0-9]*)"\s*:\s*"([A-Za-z0-9_-]+_[A-Za-z][A-Za-z0-9]*)"/g)) {
    const [, logical, full] = m;
    if (!full.endsWith("_" + logical)) continue;
    mapEntries++;
    if (!logicalToClasses.has(logical)) logicalToClasses.set(logical, new Set());
    logicalToClasses.get(logical).add(full);
  }
}

const src = fs.readFileSync(TARGET, "utf8");
const replacements = [];   // {old, nu, logical}
const alive = new Set();
const ambiguous = [];      // {old, logical, candidates}
const vanished = [];       // {old, logical}
const seen = new Set();

for (const m of src.matchAll(/([A-Za-z0-9_-]+?)_([A-Za-z][A-Za-z0-9]*)\b/g)) {
  const oldToken = m[0];
  if (seen.has(oldToken)) continue;
  const logical = m[2];
  if (!logicalToClasses.has(logical)) continue;
  seen.add(oldToken);
  if (bundles.includes(oldToken)) { alive.add(oldToken); continue; }
  const candidates = [...logicalToClasses.get(logical)].filter((c) => bundles.includes("." + c) || bundles.includes('"' + c + '"'));
  if (candidates.length === 1) replacements.push({ old: oldToken, nu: candidates[0], logical });
  else if (candidates.length === 0) vanished.push({ old: oldToken, logical });
  else ambiguous.push({ old: oldToken, logical, candidates });
}

console.log("dsh bundles: " + pkgsDir);
console.log("class-map entries: " + mapEntries + "; hashed tokens in lib/client.js: " + seen.size);
console.log("");
console.log("alive (untouched): " + [...alive].sort().join(", ") || "(none)");
if (replacements.length) {
  console.log("");
  console.log("will replace:");
  for (const r of replacements) console.log("  " + r.old + "  ->  " + r.nu + "   (logical: " + r.logical + ")");
}
if (ambiguous.length) {
  console.log("");
  console.log("AMBIGUOUS (manual decision needed, left untouched):");
  for (const a of ambiguous) console.log("  " + a.old + "  candidates: " + a.candidates.join(" | "));
}
if (vanished.length) {
  console.log("");
  console.log("VANISHED (logical name gone from build — rule is dead, prune it):");
  for (const v of vanished) console.log("  " + v.old + "   (logical: " + v.logical + ")");
}

if (!WRITE) {
  console.log("");
  console.log("dry-run only; re-run with --write to apply " + replacements.length + " replacement(s)");
  process.exit(ambiguous.length || vanished.length ? 2 : 0);
}

if (replacements.length) {
  let out = src;
  for (const r of replacements) {
    out = out.split(r.old).join(r.nu); // whole-token, prefix-complete
  }
  // sanity: braces stay balanced, file still parses via the test-suite extraction
  if ((out.match(/{/g) || []).length !== (src.match(/{/g) || []).length) {
    console.error("refusing to write: brace count changed");
    process.exit(1);
  }
  fs.writeFileSync(TARGET, out, "utf8");
  console.log("");
  console.log("wrote " + replacements.length + " replacement(s) to lib/client.js; run: node tests/run-tests.cjs");
}
