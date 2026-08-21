/**
 * Test suite for dsh-mobile-ui (portable).
 * Run: node tests/run-tests.cjs   (from anywhere)
 *
 * Sections 1-3 always run (package shape, client bundle, CSS integrity).
 * Section 4-5 need the installed dsh client bundles; they auto-discover via
 *   DSH_PKGS_DIR env var, or auto-discovery under ~/.npm/_npx, or skip.
 * Section 6 needs a live dsh web server; set DSH_BASE_URL to enable, else skip.
 * No external network access.
 */
const fs = require("fs");
const path = require("path");
const http = require("http");
const os = require("os");

const ROOT = path.resolve(__dirname, "..");
const BASE = process.env.DSH_BASE_URL || "";

let pass = 0, fail = 0, skip = 0;
function t(name, ok, detail) {
  if (ok) { pass++; console.log("  ok  " + name); }
  else { fail++; console.log("  FAIL " + name + (detail ? " — " + detail : "")); }
}
function s(name, why) { skip++; console.log("  skip " + name + (why ? " — " + why : "")); }

function get(url) {
  return new Promise((res) => {
    const r = http.get(url, { timeout: 6000 }, (rs) => {
      let d = ""; rs.on("data", (c) => d += c); rs.on("end", () => res({ code: rs.statusCode, body: d }));
    });
    r.on("error", () => res({ code: 0, body: "" }));
    r.on("timeout", () => { r.destroy(); res({ code: 0, body: "" }); });
  });
}

function discoverDshPkgs() {
  if (process.env.DSH_PKGS_DIR) return process.env.DSH_PKGS_DIR;
  const npx = path.join(os.homedir(), ".npm", "_npx");
  try {
    for (const ent of fs.readdirSync(npx)) {
      const cand = path.join(npx, ent, "node_modules", "@deepseek-ai");
      if (fs.existsSync(cand)) return cand;
    }
  } catch (e) { /* fallthrough */ }
  return null;
}

(async () => {
  console.log("\n# 1. Plugin package shape");
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, "package.json"), "utf8"));
  t("package name is dsh-mobile-ui", pkg.name === "dsh-mobile-ui");
  t("exports[./client] declared", pkg.exports && pkg.exports["./client"] === "./lib/client.js");
  t("exports[./package.json] exposed (registry probe)",
    pkg.exports && pkg.exports["./package.json"] === "./package.json",
    "without it the client registry silently skips the plugin");
  t("dsh.client.platform declared", !!(pkg.dsh && pkg.dsh.client && typeof pkg.dsh.client.platform === "string"));
  t("lib/index.js exists (host half)", fs.existsSync(path.join(ROOT, "lib/index.js")));
  t("lib/client.js exists (client half)", fs.existsSync(path.join(ROOT, "lib/client.js")));
  t("LICENSE present", fs.existsSync(path.join(ROOT, "LICENSE")));

  console.log("\n# 2. Client bundle format & execution");
  const src = fs.readFileSync(path.join(ROOT, "lib/client.js"), "utf8");
  t("ModuleLoader self-registering wrapper", src.startsWith("window.__ModuleLoader__.load({"));
  t("id matches package name", src.includes('id: "dsh-mobile-ui"'));
  const start = src.indexOf("factory: (require) => {") + "factory: (require) => {".length;
  const body = src.slice(start, src.indexOf("\n\t}\n});", start));
  let fn = null;
  try { fn = new Function("require", "module", "exports", body); t("factory syntax parses", true); }
  catch (e) { t("factory syntax parses", false, e.message); }
  if (fn) {
    let result = null;
    try { result = fn(() => ({ createElement: () => null }), { exports: {} }, {}); } catch (e) { }
    t("factory executes without reference errors", !!result);
    t("exports.apply is a function", result && typeof result.apply === "function");
  }

  console.log("\n# 3. MOBILE_CSS integrity");
  const css = (body.match(/const MOBILE_CSS = `([\s\S]*?)`;/) || [])[1] || "";
  t("CSS extracted", css.length > 3000, "got " + css.length + " bytes");
  t("braces balanced", (css.match(/{/g) || []).length === (css.match(/}/g) || []).length);
  t("4 media breakpoints present", (css.match(/@media/g) || []).length === 4);
  const stable = [
    ["frame single-track override", "#root div[style*='grid-template-columns']{grid-template-columns:minmax(0,1fr)!important}"],
    ["drawer columns JS-tagged (no :has)", "#root div[style*='grid-template-columns']>[data-dshm-col='sidebar']"],
    ["sidebar drawer follows shipped state", "body[data-mob-sidebar-open='1'] #root div[style*='grid-template-columns']>[data-dshm-col='sidebar']"],
    ["details drawer own state", "body[data-mob-panel='details']"],
    ["drag handles hidden", " [data-side]{display:none!important}"],
    ["composer bottom safe-area", ".wSkVaW_composerSeat{padding-bottom:env(safe-area-inset-bottom)"],
    ["sidebar content fills drawer", "[data-slot='sidebar']>*{width:100%!important;max-width:100%!important}"],
    ["jobs flyout centered on mobile", ".QsffPG_menu{left:50%!important"],
    ["inputs no-iOS-zoom", "#root input,#root textarea,#root select{font-size:16px}"],
    ["phone scrollbars hidden globally", "*{scrollbar-width:none!important}"],
    ["phone scrollbars hidden (webkit kernels)", "*::-webkit-scrollbar{display:none!important"],
    ["market tabs scroll on phone", ".eGUBIq_tabs{overflow-x:auto!important"],
    ["market search fills row", ".eGUBIq_tabSearch{width:100%!important}"],
    ["market grids clamp 280px floor", ".eGUBIq_grid{grid-template-columns:repeat(auto-fill,minmax(min(280px,100%),1fr))!important"],
    ["market installed rows wrap", ".eGUBIq_irow{flex-wrap:wrap!important"],
    ["market FAB repositioned", ".eGUBIq_top{right:12px!important"],
  ];
  for (const [n, str] of stable) t("stable hook: " + n, css.includes(str));
  t("dead pc_/upload selectors pruned", !css.includes(".pc_") && !css.includes(".dsh-upload"));
  t("viewport keyboard patch present", body.includes("interactive-widget=resizes-content"));
  t("details close mirrored + Esc", body.includes(".Y0dWHa_close") && body.includes('"Escape"'));
  t("landscape safe-area left/right covered", css.includes("safe-area-inset-left") && css.includes("safe-area-inset-right"));
  t("no :has() left in CSS (old WeChat XWeb kernels)", !css.includes(":has("));
  t("drawer open kills containing block (settings modal global)",
    css.includes(">[data-dshm-col='sidebar']{transform:none}") && css.includes(">[data-dshm-col='details']{transform:none}"));
  t("embedded overlay lifts host column z", css.includes("body[data-mob-embed-overlay='1']"));
  t("settings overlay watch wired in JS", body.includes(".VOzbGW_overlay"));
  t("scroll lock while drawer open", css.includes("body[data-mob-lock='1']{overflow:hidden}"));
  t("overscroll containment on drawers", (css.match(/overscroll-behavior:contain/g) || []).length >= 2);
  t("reduced-motion respected", css.includes("prefers-reduced-motion:reduce"));
  t("no permanent will-change", !css.includes("will-change"));
  const mixLines = css.split("\n").filter((l) => l.includes("background:color-mix("));
  t("color-mix backgrounds carry rgba fallback",
    mixLines.length > 0 && mixLines.every((l) => l.includes("background:rgba(")),
    mixLines.length + " color-mix lines, " + mixLines.filter((l) => !l.includes("background:rgba(")).length + " without fallback");
  t("hash drift self-check present", body.includes("refresh-hashes.mjs") && body.includes("__dshMobileUi"));
  t("market modal dead scope pruned", !css.includes("_15u5s_"));

  console.log("\n# 4. rc6 hash liveness (against installed dsh bundles)");
  const pkgsDir = discoverDshPkgs();
  if (!pkgsDir) {
    s("hash liveness", "dsh client bundles not found; set DSH_PKGS_DIR to enable");
  } else {
    const bundles = fs.readdirSync(pkgsDir).filter(d => d.startsWith("dsh-client-ui-"))
      .map(d => { try { return fs.readFileSync(path.join(pkgsDir, d, "lib/client.js"), "utf8"); } catch (e) { return ""; } }).join("");
    const prefixes = ["uV2eYG_", "wSkVaW_", "FJxK0a_", "VOzbGW_", "zGbnIq_", "p-xYUq_", "pXSMma_", "Md3f7G_", "Sxvs8a_", "NM4-hq_", "_7KE1Ra_", "qSYn7G_", "At1oFq_", "rtSEdW_", "Y0dWHa_", "QsffPG_", "pbvGtq_", "YyYd_"];
    for (const p of prefixes) t("hash " + p + "* exists in build", bundles.includes("." + p));
    console.log("\n# 5. JS DOM hooks referenced by client.js");
    for (const h of ["o3BgMG_inspectButton", "Y0dWHa_close"]) t("hook ." + h + " exists in build", bundles.includes(h));
  }

  console.log("\n# 4b. community plugin css-scope liveness (web profile installs)");
  const profileMarket = path.join(os.homedir(), ".dsh", "profiles", "web", "node_modules", "dshmarket", "client", "client.js");
  if (fs.existsSync(profileMarket)) {
    const mc = fs.readFileSync(profileMarket, "utf8");
    t("dshmarket scope eGUBIq_* exists in installed bundle", mc.includes(".eGUBIq_root"),
      "market upgraded? re-derive the css-module scope and refresh the rules");
  } else {
    s("dshmarket scope liveness", "dshmarket not installed in the web profile");
  }
  t("shell.overlay slot used", body.includes('"shell.overlay"'));

  console.log("\n# 5.5 Third-party plugin hooks (profile node_modules)");
  const profileDir = process.env.DSH_PROFILE_DIR || path.join(os.homedir(), ".dsh", "profiles", "web", "node_modules");
  let third = "";
  try {
    const grab = (base) => { for (const f of [path.join(base, "client", "client.js"), path.join(base, "lib", "client.js")]) { try { third += fs.readFileSync(f, "utf8"); } catch (e) {} } };
    for (const ent of fs.readdirSync(profileDir, { withFileTypes: true })) {
      if (!ent.isDirectory() || ent.name.startsWith(".")) continue;
      const base = path.join(profileDir, ent.name);
      if (ent.name.startsWith("@")) { try { for (const n of fs.readdirSync(base)) grab(path.join(base, n)); } catch (e) {} }
      else if (ent.name !== "dsh-mobile-ui") grab(base);
    }
  } catch (e) {}
  if (!third) s("third-party hooks", "profile node_modules not found; set DSH_PROFILE_DIR to enable");
  else for (const h of ["eGUBIq_tabs", "aionui-preview-col", "data-dsh-live-tps"]) t("third-party hook " + h + " exists", third.includes(h));

  console.log("\n# 6. Runtime integration (live server)");
  if (!BASE) {
    s("live server checks", "set DSH_BASE_URL (e.g. http://127.0.0.1:3080) to enable");
  } else {
    const home = await get(BASE + "/");
    t("server up", home.code === 200, "got " + home.code);
    const cj = await get(BASE + "/plugins/dsh-mobile-ui/client.js");
    t("mobile-ui client.js served 200", cj.code === 200, "got " + cj.code);
    if (cj.code === 200) t("served bundle is our ModuleLoader code",
      cj.body.startsWith("window.__ModuleLoader__.load({") && cj.body.includes('"dsh-mobile-ui"'));
    if (cj.code === 200) t("served bundle is current (v1.4 markers)",
      cj.body.includes("data-dshm-col") && cj.body.includes("interactive-widget=resizes-content") && cj.body.includes("eGUBIq_tabs") && cj.body.includes("scrollbar-width:none!important"),
      "stale install in ~/.dsh/profiles/web — re-copy lib/ and restart");
    const mk = await get(BASE + "/plugins/dshmarket/client.js");
    t("dshmarket client.js served 200", mk.code === 200, "got " + mk.code);
  }

  console.log("\n========================================");
  console.log("RESULT: " + pass + " passed, " + fail + " failed, " + skip + " skipped " +
    (fail === 0 ? "— GREEN ✓" : "— RED, FIX REQUIRED ✗"));
  process.exit(fail === 0 ? 0 : 1);
})();
