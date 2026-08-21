window.__ModuleLoader__.load({
	id: "dsh-mobile-ui",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		const react = require("react");
		const h = react.createElement;

		/* Mobile responsive layer for the DSH web GUI (client half).
		 * - Frame hooks are STABLE: the app frame is the unique
		 *   div[style*='grid-template-columns']; its drawer columns are TAGGED
		 *   [data-dshm-col=sidebar|details] by JS, so the stylesheet needs no
		 *   CSS :has() (older WeChat XWeb kernels do not implement it) and no
		 *   expensive body:has(div[style*=...]) recalc selector.
		 * - Sidebar drawer FOLLOWS the shipped state via data-sidebar-collapsed,
		 *   mirrored onto body[data-mob-sidebar-open]; details drawer keeps a
		 *   plugin body[data-mob-panel] flag (exclusive), closed by the pane's
		 *   own close button (mirrored) or Escape — the frame's
		 *   data-details-collapsed CANNOT gate it: it is derived
		 *   (cols.details===0) and phones keep it collapsed by design.
		 * - While either drawer covers the screen, body[data-mob-lock] stops the
		 *   page behind it from scrolling (plus overscroll-behavior:contain).
		 * - rc6-marked rules use content-hashed classes of dsh 0.1.0-rc.6;
		 *   scripts/refresh-hashes.mjs rewrites them after a dsh upgrade, and a
		 *   one-shot runtime self-check warns when they have drifted.
		 * - All layout rules live under @media (max-width:820px); desktop intact. */

		const MOBILE_CSS = `
.dshm-fab,.dshm-backdrop{display:none}
@media (max-width:820px){
  :root{--dshm-ease:cubic-bezier(.4,0,.2,1)}
  html{-webkit-text-size-adjust:100%;text-size-adjust:100%}
  html,body{overflow-x:hidden}
  /* (1.4.0) scrollbars hidden globally: touch/wheel scrolling needs no gutter
     and the desktop gutter steals 8-15px from every scrolling pane. Only the
     chrome disappears — overflow scrolling itself is untouched. !important
     outranks plugin styles that set scrollbar-width:thin (e.g. dshmarket's
     screenshot strip); the ::-webkit-scrollbar rule covers older WeChat XWeb
     kernels that predate scrollbar-width (Chrome <121 / Safari <18.2). */
  *{scrollbar-width:none!important}
  *::-webkit-scrollbar{display:none!important;width:0!important;height:0!important}
  #root img,#root svg,#root video,#root canvas{max-width:100%;height:auto}
  #root pre{max-width:100%;overflow-x:auto;box-sizing:border-box}
  #root table{max-width:100%;display:block;overflow-x:auto}
  #root input,#root textarea,#root select{font-size:16px}
  #root button,#root [role=button]{-webkit-tap-highlight-color:transparent}
  #root div[style*='grid-template-columns']{grid-template-columns:minmax(0,1fr)!important}
  #root div[style*='grid-template-columns'] [data-side]{display:none!important}
  #root div[style*='grid-template-columns']>[data-dshm-col='sidebar']{
    position:fixed!important;top:0;bottom:0;left:0;width:min(86vw,340px)!important;max-width:min(86vw,340px);
    z-index:60;transform:translateX(-106%);transition:transform .26s var(--dshm-ease);
    box-shadow:12px 0 40px rgba(0,0,0,.30);padding-bottom:env(safe-area-inset-bottom);
    padding-left:env(safe-area-inset-left);overscroll-behavior:contain;
  }
  /* (1.4.1) transform:none — NOT translateX(0) — while OPEN: a transformed
     ancestor is the containing block AND stacking context for position:fixed
     descendants, which trapped the inline-rendered settings overlay
     (.VOzbGW_overlay, fixed inset:0 z:1000, NOT portaled) inside the 340px
     drawer. none <-> translateX(-106%) still interpolates, so the slide
     animation survives; identity transform also stopped creating a layer. */
  body[data-mob-sidebar-open='1'] #root div[style*='grid-template-columns']>[data-dshm-col='sidebar']{transform:none}
  /* sidebar content fills the drawer: the shipped root sets an inline width from the
     desktop preference (280px), which left a large right gap inside a wider drawer */
  [data-slot='sidebar']>*{width:100%!important;max-width:100%!important}
  #root div[style*='grid-template-columns']>[data-dshm-col='details']{
    position:fixed!important;top:0;bottom:0;right:0;left:auto;width:min(94vw,460px)!important;max-width:min(94vw,460px);
    z-index:60;transform:translateX(106%);transition:transform .26s var(--dshm-ease);
    box-shadow:-12px 0 40px rgba(0,0,0,.30);padding-bottom:env(safe-area-inset-bottom);
    padding-right:env(safe-area-inset-right);overscroll-behavior:contain;
  }
  body[data-mob-panel='details'] #root div[style*='grid-template-columns']>[data-dshm-col='details']{transform:none}
  /* (1.4.2) while an embedded fullscreen overlay (settings) is open, HIDE the
     FAB instead of lifting the column: the column must STAY at z:60 so the
     app's portaled Select/Menu popups (z:100/101) keep layering above the
     dialog — a z-lift to 1200 buried every dropdown and left only inline
     controls (theme swatches) usable */
  body[data-mob-embed-overlay='1'] #dshm-fab-sidebar{display:none!important}
  /* while either drawer covers the screen, stop the page behind it from scrolling */
  body[data-mob-lock='1']{overflow:hidden}
  [data-slot='conversation'] [data-phase]{--dsh-composer-side-clearance:6px!important;--dsh-composer-dock-inset:4px!important}
  .wSkVaW_header{padding:calc(env(safe-area-inset-top,0px) + 8px) 10px 0 54px!important}
  /* (1.4.7) the title row ABOVE the tabs (crumbs + utilities + actions) crams
     into one line beside the FAB clearance on phones — split it into two
     rows: crumbs own row 1 (and breathe again), utilities + actions move to
     right-aligned row 2. The tabs row below is untouched. */
  .wSkVaW_titleRow{flex-wrap:wrap!important;gap:2px 0!important;min-height:0!important}
  .wSkVaW_titleCluster{flex:1 1 100%!important}
  .wSkVaW_tabs{gap:20px!important}
  .wSkVaW_crumb{max-width:32vw!important}
  .wSkVaW_crumbCurrent{max-width:50vw!important}
  .wSkVaW_headerUtilities{margin-left:auto!important}
  .wSkVaW_headerActions{gap:4px!important}
  .wSkVaW_composerSeat{padding-bottom:env(safe-area-inset-bottom)!important}
  .uV2eYG_card{border-radius:18px!important;gap:8px!important}
  .uV2eYG_row{flex-wrap:wrap!important;gap:6px 8px!important;padding:2px 6px 6px!important}
  .uV2eYG_tools{gap:8px!important;min-width:0!important;flex:0 0 auto!important}
  .uV2eYG_modes{gap:8px!important;min-width:0!important}
  .uV2eYG_trailing{flex:0 1 auto!important;min-width:0!important;gap:8px!important;justify-content:flex-end!important}
  /* rc6 ModelSelect: reasoning-effort badge doubles the trigger width on phones
     (GLM-5.3 + "Default" ≈ 102px) and squeezes the composer row into an ugly wrap.
     Hide the badge text on narrow screens — the effort is still selectable in the menu. */
  ._7KE1Ra_trigger{max-width:100%!important;min-width:0!important;gap:2px!important;padding:0 2px 0 8px!important}
  ._7KE1Ra_triggerEffort{display:none!important}
  /* rc6 Jobs flyout (session-header background-tasks list):
     absolute left:0 panel overflows the right edge on phones; rows cram
     kind+label+status+duration into one 336px line. Center the panel on the
     viewport, let rows wrap, and give status room to breathe. */
  .QsffPG_menu{left:50%!important;transform:translateX(-50%)!important;width:min(92vw,400px)!important;max-width:92vw!important;position:fixed!important;top:calc(env(safe-area-inset-top,0px) + 52px)!important;max-height:min(60vh,420px)!important}
  .QsffPG_row{flex-wrap:wrap!important;gap:2px 8px!important;padding:7px 10px!important}
  .QsffPG_kind{font-size:10px!important;line-height:16px!important}
  .QsffPG_label{flex:1 1 100%!important;white-space:normal!important;overflow-wrap:anywhere!important;line-height:16px!important}
  .QsffPG_status{max-width:60%!important;flex:0 1 auto!important}
  .QsffPG_duration{margin-left:auto!important}
  .uV2eYG_primary{transform:none!important}
  .p-xYUq_actions{gap:4px!important;height:auto!important;min-height:28px!important;flex-wrap:wrap!important}
  .p-xYUq_timeStart,.p-xYUq_timeEnd{font-size:11px!important;line-height:16px!important;padding:0 4px!important;white-space:normal!important;overflow-wrap:anywhere!important}
  .p-xYUq_runTimeDot{margin:0 2px!important}
  .Md3f7G_column{gap:14px!important}

  /* --- dsh-web-ui (linxin666) compatibility, phone layer only ---
     aionui right-side panel: collapsed tracks keep a 1px border and
     absolute 2px drag-handle lines at wrong offsets under the forced
     single-column grid - strip the borders and hide the handles;
     panels stay mounted, maximize-overlay still works on narrow screens. */
  .aionui-preview-col,.aionui-panel{border-left:none!important}
  /* (1.4.1) aionui-explorer-col / both *-handle selectors pruned: aionui-panel
     0.2.7 renamed the explorer column to .aionui-panel and dropped the handles */
  /* live-stats TPS row + stats capsules stack 4 rows on phones: tighten
     capsules and the TPS line so the composer dock stays 2 rows max. */
  [data-dsh-live-tps]{display:none!important}
  .Sxvs8a_root,.NM4-hq_text{overflow-wrap:anywhere;word-break:break-word}
  .FJxK0a_root{display:flex!important;flex-wrap:wrap!important;justify-content:center!important;gap:4px 6px!important;padding:4px 8px 2px!important;overflow:visible!important;line-height:16px!important}
  .FJxK0a_sep{display:none!important}
  .FJxK0a_root>span:not(.FJxK0a_sep){display:inline-flex!important;align-items:center!important;white-space:nowrap!important;padding:1px 8px!important;border-radius:999px!important;background:var(--dsw-alias-interactive-bg-hover,rgba(127,127,127,.10))!important;color:var(--dsw-alias-label-tertiary)!important;font-size:11px!important;line-height:16px!important}
  /* capsule tints: plain rgba first (older kernels drop color-mix), color-mix upgrade second */
  .FJxK0a_root>span:nth-of-type(1):not(.FJxK0a_sep){color:var(--dsw-alias-state-business-primary,#4d6bfe)!important;background:rgba(77,107,254,.12)!important;background:color-mix(in srgb,var(--dsw-alias-state-business-primary,#4d6bfe) 12%,transparent)!important}
  .FJxK0a_root>span:nth-of-type(3):not(.FJxK0a_sep){color:var(--dsw-alias-label-primary-bluish,#6d7dcc)!important;background:rgba(167,139,250,.13)!important;background:color-mix(in srgb,#a78bfa 13%,transparent)!important}
  .FJxK0a_root>span:nth-of-type(5):not(.FJxK0a_sep){color:#8a63d9!important;background:rgba(124,154,255,.13)!important;background:color-mix(in srgb,#7c9aff 13%,transparent)!important}
  .FJxK0a_root>span:nth-of-type(7):not(.FJxK0a_sep){color:var(--dsw-alias-state-success-primary,#2ea86a)!important;background:rgba(46,168,106,.12)!important;background:color-mix(in srgb,var(--dsw-alias-state-success-primary,#2ea86a) 12%,transparent)!important}
  .FJxK0a_root>span:nth-of-type(9):not(.FJxK0a_sep){color:var(--dsw-alias-state-warn-primary,#c2821c)!important;background:rgba(194,130,28,.12)!important;background:color-mix(in srgb,var(--dsw-alias-state-warn-primary,#c2821c) 12%,transparent)!important}
  .FJxK0a_root>span:nth-of-type(2n+11):not(.FJxK0a_sep){color:var(--dsw-alias-label-secondary,#5c6673)!important;background:rgba(92,102,115,.10)!important;background:color-mix(in srgb,var(--dsw-alias-label-secondary,#5c6673) 10%,transparent)!important}
  .pXSMma_headline{font-size:22px!important;line-height:28px!important;column-gap:8px!important;grid-template-columns:28px auto auto!important}
  .pXSMma_previewBadge{font-size:11px!important}
  .dshm-backdrop{position:fixed;inset:0;z-index:55;background:rgba(0,0,0,.45);display:none}
  body[data-mob-sidebar-open='1'] .dshm-backdrop,
  body[data-mob-panel='details'] .dshm-backdrop{display:block}
  .dshm-fab{
    position:fixed;top:calc(env(safe-area-inset-top,0px) + 8px);left:calc(env(safe-area-inset-left,0px) + 8px);z-index:70;
    width:40px;height:40px;display:inline-flex;align-items:center;justify-content:center;border-radius:12px;
    background:var(--dsw-alias-button-floating-fill,rgba(127,127,127,.18));color:var(--dsw-alias-text-primary,currentColor);
    border:1px solid var(--dsw-alias-border-l2,rgba(127,127,127,.2));box-shadow:0 2px 10px rgba(0,0,0,.20);
    cursor:pointer;-webkit-tap-highlight-color:transparent;touch-action:manipulation;padding:0;
  }
  body[data-mob-sidebar-open='1'] #dshm-fab-sidebar{background:var(--dsw-alias-color-accent,#4d8cff);color:#fff}

  /* rc6 settings tabs strip + plugin card footers (plugin-inventory page).
     plugin-console (pc) and file-uploads rules were pruned in 1.1.0: those
     plugins are not installed in this profile — verified by scanning every
     installed client bundle; the rules matched nothing. */
  .pbvGtq_tabs{gap:14px!important;overflow-x:auto!important}
  .YyYd_a_name{font-size:14px!important}
  .YyYd_a_description{font-size:12px!important}
  .YyYd_a_footer{flex-wrap:wrap!important;gap:6px!important;justify-content:flex-end!important}
  .YyYd_a_footer>*{flex:none!important;white-space:nowrap!important}
  /* semantic tag colors restored, phone layer only: rgba fallback first, color-mix upgrade second */
  .zGbnIq_rowTag{background:rgba(77,107,254,.14)!important;background:color-mix(in srgb,var(--dsw-alias-state-business-primary,#4d6bfe) 14%,transparent)!important;border-color:transparent!important;color:var(--dsw-alias-state-business-primary,#4d6bfe)!important}
  .qSYn7G_configTag{background:rgba(109,125,204,.13)!important;background:color-mix(in srgb,var(--dsw-alias-label-primary-bluish,#6d7dcc) 13%,transparent)!important;color:var(--dsw-alias-label-primary-bluish,#6d7dcc)!important}
  .At1oFq_badge{background:rgba(77,107,254,.12)!important;background:color-mix(in srgb,var(--dsw-alias-state-business-primary,#4d6bfe) 12%,transparent)!important;color:var(--dsw-alias-state-business-primary,#4d6bfe)!important}
  .At1oFq_badgeMuted{background:rgba(92,102,115,.12)!important;background:color-mix(in srgb,var(--dsw-alias-label-secondary,#5c6673) 12%,transparent)!important;color:var(--dsw-alias-label-secondary,#5c6673)!important}
  .rtSEdW_badge{background:rgba(92,102,115,.12)!important;background:color-mix(in srgb,var(--dsw-alias-label-secondary,#5c6673) 12%,transparent)!important;color:var(--dsw-alias-label-secondary,#5c6673)!important}
  .Y0dWHa_kindTag{background:rgba(109,125,204,.13)!important;background:color-mix(in srgb,var(--dsw-alias-label-primary-bluish,#6d7dcc) 13%,transparent)!important;color:var(--dsw-alias-label-primary-bluish,#6d7dcc)!important}

  /* --- dshmarket plugin market (v1.11.x css-scope eGUBIq_, phone layer) ---
     The market renders inside the settings dialog and assumes ~700px of
     content width. Phones: the tab strip scrolls instead of overflowing,
     the fixed-width search fills the row, banner actions wrap below their
     text, plugin/backup grids clamp their 280px column floor to the
     container, the installed-row src/owner/action nowrap trio wraps, and
     diagnostics meta wraps instead of ellipsizing at 320px.
     (1.4.1) the shell-Modal rules were pruned: that primitive is no longer
     mounted by dshmarket 1.16 / the rc.8 shell — verified dead. */
  .eGUBIq_titleRow{flex-wrap:wrap!important;gap:6px 8px!important}
  .eGUBIq_sub{flex-wrap:wrap!important;gap:6px 8px!important}
  .eGUBIq_tabs{overflow-x:auto!important;gap:0!important}
  .eGUBIq_tabs>.eGUBIq_grow{display:none!important}
  .eGUBIq_tab{flex:none!important;padding:7px 10px!important}
  .eGUBIq_banner{flex-wrap:wrap!important}
  .eGUBIq_banner>.eGUBIq_grow{flex:1 1 auto!important;min-width:0!important}
  .eGUBIq_tabSearchRow{padding:0 0 8px!important}
  .eGUBIq_tabSearch{width:100%!important}
  .eGUBIq_grid{grid-template-columns:repeat(auto-fill,minmax(min(280px,100%),1fr))!important;gap:10px!important}
  .eGUBIq_backupGrid{grid-template-columns:repeat(auto-fit,minmax(min(280px,100%),1fr))!important;gap:10px!important}
  .eGUBIq_card{padding:10px 12px!important;gap:10px!important}
  .eGUBIq_row1{flex-wrap:wrap!important}
  .eGUBIq_foot{flex-wrap:wrap!important}
  .eGUBIq_irow{flex-wrap:wrap!important;row-gap:6px!important}
  .eGUBIq_irow>.eGUBIq_src,.eGUBIq_irow>.eGUBIq_owner{white-space:normal!important;overflow-wrap:anywhere!important;min-width:0!important}
  .eGUBIq_backupCheckList .eGUBIq_grow{flex:1 1 100%!important;white-space:normal!important}
  .eGUBIq_backupCheckList .eGUBIq_spec{flex:1 1 100%!important;max-width:100%!important;text-align:left!important;white-space:normal!important}
  .eGUBIq_diagSummaryMeta{white-space:normal!important;max-width:100%!important;overflow-wrap:anywhere!important}
  .eGUBIq_diagKey{min-width:0!important}
  .eGUBIq_top{right:12px!important;bottom:calc(env(safe-area-inset-bottom,0px) + 18px)!important}
}
@media (max-width:640px){
  /* (1.4.3) dialog breathes: 12px inset from the screen edges instead of the
     near-full-bleed 6px; panel fills the padded content box.
     (1.4.4) panel-INTERIOR inset: the rounded panel itself gets 10px padding
     so every layer inside sits off the border; the options column
     compensates to the official 24px visual side padding (14 + 10).
     (1.4.5) the tabs strip is INCLUDED in the inset — no negative margins,
     its divider breaks with the padding ring instead of spanning edge to edge */
  .VOzbGW_overlay{padding:12px!important}
  .VOzbGW_panel{width:100%!important;max-width:100%!important;height:min(800px,calc(100vh - 24px))!important;border-radius:14px!important;flex-direction:column!important;padding:10px!important}
  .VOzbGW_nav{width:100%!important;flex:none!important;flex-direction:row!important;align-items:center;gap:4px!important;padding:6px 10px 8px!important;overflow-x:auto;overflow-y:hidden;border-bottom:1px solid var(--dsw-alias-border-l2)}
  .VOzbGW_navTitle{display:none!important}
  .VOzbGW_navList{flex-direction:row!important;gap:2px!important;flex-wrap:nowrap!important}
  .VOzbGW_navCell{white-space:nowrap!important;height:32px!important;padding:0 12px!important;flex:none!important}
  .VOzbGW_content{flex:1 1 auto!important;min-height:0!important}
  .VOzbGW_options{padding:0 14px 14px!important}
  .zGbnIq_rowIdentity{flex:1 1 auto!important;min-width:0!important}
  .zGbnIq_rowName{min-width:0!important;max-width:100%!important;overflow:hidden!important;text-overflow:ellipsis!important;white-space:nowrap!important}
  .zGbnIq_rowActions{flex:none!important;white-space:nowrap!important}
  .zGbnIq_rowActions .zGbnIq_secondaryButton,.zGbnIq_rowActions .zGbnIq_dangerButton{flex:none!important;white-space:nowrap!important}
}
@media (max-width:380px){.pXSMma_previewBadge{display:none!important}}
@media (max-width:820px) and (prefers-reduced-motion:reduce){
  #root div[style*='grid-template-columns']>[data-dshm-col='sidebar'],
  #root div[style*='grid-template-columns']>[data-dshm-col='details']{transition:none!important}
}
`;

		function apply(ctx) {
			const slots = ctx.get("slots");
			if (slots === undefined) return;

			const disposers = [];

			// stylesheet (package-owned <style> tag; removed on fiber dispose)
			const tag = document.createElement("style");
			tag.dataset.plugin = "dsh-mobile-ui";
			tag.dataset.pluginCss = "dsh-mobile-ui/mobile.css";
			tag.textContent = MOBILE_CSS;
			document.head.appendChild(tag);
			disposers.push(() => tag.remove());

			// viewport-fit=cover so env(safe-area-inset-*) is live on notched phones
			const meta = document.querySelector('meta[name="viewport"]');
			let prevContent = null, touched = false;
			if (meta) {
				prevContent = meta.getAttribute("content");
				let next = prevContent || "";
				if (!/viewport-fit/.test(next)) next += ", viewport-fit=cover";
				if (!/interactive-widget/.test(next)) next += ", interactive-widget=resizes-content";
				if (next !== prevContent) { meta.setAttribute("content", next); touched = true; }
			}
			disposers.push(() => { if (meta && touched) meta.setAttribute("content", prevContent); });

			// details-drawer state (plugin-owned); the sidebar drawer uses the
			// SHIPPED layout state, mirrored onto <body> by the frame observer.
			let detailsOpen = false;

			// ---- frame state mirror ------------------------------------------------
			// Tags the frame's drawer columns with [data-dshm-col] and mirrors the
			// shipped sidebar state onto body[data-mob-sidebar-open] / lock flag.
			// Replaces the CSS :has() chains (unsupported on older WeChat XWeb
			// kernels, and costly on every style recalc). Mutation work is
			// rAF-coalesced and only reacts to frame attribute flips or
			// structural/slot changes — conversation streaming stays cheap.
			const mq = window.matchMedia("(max-width: 820px)");
			const FRAME_QUERY = "#root div[style*='grid-template-columns']";
			const SLOT_QUERY = "[data-slot='sidebar'],[data-slot='details']";
			// inline fullscreen overlays rendered INSIDE a drawer column (settings is
			// not portaled) must re-run the mirror so the embed flag + z-lift engage
			const OVERLAY_QUERY = ".VOzbGW_overlay";
			const WATCH_QUERY = SLOT_QUERY + "," + OVERLAY_QUERY;
			let frameEl = null, raf = 0, wantRetag = false, wantOpen = false;

			function syncLock() {
				const lock = mq.matches && (document.body.dataset.mobSidebarOpen === "1" || detailsOpen);
				if (lock) document.body.dataset.mobLock = "1";
				else delete document.body.dataset.mobLock;
			}
			function syncOpen() {
				const open = !!(frameEl && !frameEl.hasAttribute("data-sidebar-collapsed"));
				if (open) document.body.dataset.mobSidebarOpen = "1";
				else delete document.body.dataset.mobSidebarOpen;
				const embed = !!(frameEl && frameEl.querySelector(OVERLAY_QUERY));
				if (embed) document.body.dataset.mobEmbedOverlay = "1";
				else delete document.body.dataset.mobEmbedOverlay;
				syncLock();
			}
			function retag() {
				if (!frameEl || !frameEl.isConnected) frameEl = document.querySelector(FRAME_QUERY);
				if (!frameEl) { syncOpen(); return; }
				for (const col of frameEl.children) {
					let want = "";
					if (col.querySelector("[data-slot='sidebar']")) want = "sidebar";
					else if (col.querySelector("[data-slot='details']")) want = "details";
					if (want) col.dataset.dshmCol = want;
					else if (col.dataset.dshmCol) delete col.dataset.dshmCol;
				}
				syncOpen();
			}
			function run() {
				raf = 0;
				const r = wantRetag, o = wantOpen;
				wantRetag = wantOpen = false;
				if (r) retag();
				else if (o) syncOpen();
			}
			const queue = (retagWanted, openWanted) => {
				wantRetag = wantRetag || retagWanted;
				wantOpen = wantOpen || openWanted;
				if (!raf) raf = requestAnimationFrame(run);
			};
			const onMutations = (muts) => {
				if (!frameEl || !frameEl.isConnected) { queue(true, true); return; }
				for (const m of muts) {
					if (m.type === "attributes") { if (m.target === frameEl) queue(false, true); continue; }
					if (m.target === frameEl) { queue(true, false); continue; } // frame children changed
					for (const list of [m.addedNodes, m.removedNodes]) {
						for (const n of list) {
							if (n.nodeType !== 1) continue;
							if ((n.matches && n.matches(WATCH_QUERY)) || (n.querySelector && n.querySelector(WATCH_QUERY))) { queue(true, false); return; }
						}
					}
				}
			};
			const mo = new MutationObserver(onMutations);
			mo.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ["data-sidebar-collapsed", "style"] });
			const onMq = () => queue(true, true);
			if (mq.addEventListener) mq.addEventListener("change", onMq);
			else if (mq.addListener) mq.addListener(onMq);
			retag();
			disposers.push(() => {
				mo.disconnect();
				if (mq.removeEventListener) mq.removeEventListener("change", onMq);
				else if (mq.removeListener) mq.removeListener(onMq);
				if (raf) cancelAnimationFrame(raf);
				delete document.body.dataset.mobSidebarOpen;
				delete document.body.dataset.mobLock;
				delete document.body.dataset.mobEmbedOverlay;
			});

			const setDetails = (open) => {
				detailsOpen = open;
				if (open) document.body.dataset.mobPanel = "details";
				else delete document.body.dataset.mobPanel;
				syncLock();
			};

			const Hamburger = () => h("svg", { viewBox: "0 0 24 24", width: 22, height: 22, "aria-hidden": true, fill: "none" },
				h("path", { d: "M3 6h18M3 12h18M3 18h18", stroke: "currentColor", "stroke-width": 2, "stroke-linecap": "round" }));
	
			function MobileChrome() {
				const layout = ctx.get("layout");
				const sidebarOpen = () => document.body.dataset.mobSidebarOpen === "1";
				const toggleSidebar = () => { if (layout) { try { layout.toggleSidebar(); } catch (e) {} } };
				const onSidebar = () => { if (detailsOpen) setDetails(false); toggleSidebar(); };
				const onClose = () => { if (detailsOpen) setDetails(false); if (sidebarOpen()) toggleSidebar(); };
				return h("div", { style: { display: "contents" } },
					h("div", { className: "dshm-backdrop", onClick: onClose, "aria-hidden": true }),
					h("button", { type: "button", id: "dshm-fab-sidebar", className: "dshm-fab", onClick: onSidebar, "aria-label": "会话列表" }, h(Hamburger)));
			}

			disposers.push(slots.inject("shell.overlay", () => slots.register(
				{ name: "shell.overlay", id: "dsh-mobile-chrome", order: 1000 },
				() => h(MobileChrome),
			)));

	
		/* (1.1.0) zh plugin-console description decorator removed: dsh-plugin-console
		 * is not installed in this profile, so the 7.3KB map and the 800ms
		 * polling interval were pure dead weight on every page load. */

		// tapping a tool call's inspect affordance opens the details drawer
			disposers.push(ctx.effect(() => {
				const onDocClick = (e) => {
					const t = e.target;
					if (!(t && t.closest)) return;
					// tool card's "inspect" affordance → open the details drawer
					if (t.closest(".o3BgMG_inspectButton")) setTimeout(() => setDetails(true), 0);
					// the pane's own close button (rc6 .Y0dWHa_close) clears the selection
					// while cols.details stays 0 on phones (auto-collapsed by
					// computeColumns), so nothing else would close the drawer — mirror it
					if (detailsOpen && t.closest(".Y0dWHa_close")) setDetails(false);
				};
				const onKey = (e) => {
					if (e.key !== "Escape") return;
					if (detailsOpen) { setDetails(false); return; }
					if (document.body.dataset.mobSidebarOpen === "1") {
						const layout = ctx.get("layout");
						try { layout && layout.toggleSidebar(); } catch (err) {}
					}
				};
				document.addEventListener("click", onDocClick, true);
				document.addEventListener("keydown", onKey, true);
				return () => {
					document.removeEventListener("click", onDocClick, true);
					document.removeEventListener("keydown", onKey, true);
				};
			}, "dsh-mobile: inspect opens details"));

			// one-shot hash liveness self-check: if every rc6 anchor class is absent
			// the dsh build has changed under us — say so instead of failing silently
			const selfCheck = setTimeout(() => {
				const anchors = ["uV2eYG_card", "wSkVaW_header", "FJxK0a_root"];
				const missing = anchors.filter((c) => !document.querySelector("." + c));
				window.__dshMobileUi = { version: "1.4.7", frameTagged: !!(frameEl && frameEl.querySelector("[data-dshm-col]")), missing };
				if (missing.length === anchors.length)
					console.warn("[dsh-mobile-ui] no rc6 anchor classes found — the dsh build changed; run scripts/refresh-hashes.mjs and reinstall the plugin");
			}, 3000);
			disposers.push(() => clearTimeout(selfCheck));

			ctx.effect(() => () => {
				disposers.splice(0).forEach((d) => { try { d(); } catch (e) {} });
				delete document.body.dataset.mobPanel;
			}, "dsh-mobile: teardown");
		}

		exports.apply = apply;
		return module.exports;
	}
});
