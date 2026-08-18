window.__ModuleLoader__.load({
	id: "dsh-mobile-ui",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		const react = require("react");
		const h = react.createElement;

		/* Mobile responsive layer for the DSH web GUI (client half).
		 * - Frame hooks are STABLE: the app frame is the unique
		 *   div[style*='grid-template-columns']; columns hold [data-slot=...].
		 * - Sidebar drawer FOLLOWS the shipped state via data-sidebar-collapsed;
		 *   details drawer keeps a plugin body[data-mob-panel] flag (exclusive),
		 *   closed by the pane's own close button (mirrored) or Escape — the
		 *   frame's data-details-collapsed CANNOT gate it: it is derived
		 *   (cols.details===0) and phones keep it collapsed by design.
		 * - rc6-marked rules use content-hashed classes of dsh 0.1.0-rc.6.
		 * - All layout rules live under @media (max-width:820px); desktop intact. */

		const MOBILE_CSS = `
.dshm-fab,.dshm-backdrop{display:none}
@media (max-width:820px){
  :root{--dshm-ease:cubic-bezier(.4,0,.2,1)}
  html{-webkit-text-size-adjust:100%;text-size-adjust:100%}
  html,body{overflow-x:hidden}
  #root img,#root svg,#root video,#root canvas{max-width:100%;height:auto}
  #root pre{max-width:100%;overflow-x:auto;-webkit-overflow-scrolling:touch;box-sizing:border-box}
  #root table{max-width:100%;display:block;overflow-x:auto;-webkit-overflow-scrolling:touch}
  #root input,#root textarea,#root select{font-size:16px}
  #root button,#root [role=button]{-webkit-tap-highlight-color:transparent}
  #root div[style*='grid-template-columns']{grid-template-columns:minmax(0,1fr)!important}
  #root div[style*='grid-template-columns'] [data-side]{display:none!important}
  #root div[style*='grid-template-columns']>*:has([data-slot='sidebar']){
    position:fixed!important;top:0;bottom:0;left:0;width:min(86vw,340px)!important;max-width:min(86vw,340px);
    z-index:60;transform:translateX(-106%);transition:transform .26s var(--dshm-ease);
    box-shadow:12px 0 40px rgba(0,0,0,.30);will-change:transform;padding-bottom:env(safe-area-inset-bottom);
    padding-left:env(safe-area-inset-left);
  }
  #root div[style*='grid-template-columns']:not([data-sidebar-collapsed])>*:has([data-slot='sidebar']){transform:translateX(0)}
  /* sidebar content fills the drawer: the shipped root sets an inline width from the
     desktop preference (280px), which left a large right gap inside a wider drawer */
  [data-slot='sidebar']>*{width:100%!important;max-width:100%!important}
  #root div[style*='grid-template-columns']>*:has([data-slot='details']){
    position:fixed!important;top:0;bottom:0;right:0;left:auto;width:min(94vw,460px)!important;max-width:min(94vw,460px);
    z-index:60;transform:translateX(106%);transition:transform .26s var(--dshm-ease);
    box-shadow:-12px 0 40px rgba(0,0,0,.30);will-change:transform;padding-bottom:env(safe-area-inset-bottom);
    padding-right:env(safe-area-inset-right);
  }
  body[data-mob-panel='details'] #root div[style*='grid-template-columns']>*:has([data-slot='details']){transform:translateX(0)}
  [data-slot='conversation'] [data-phase]{--dsh-composer-side-clearance:6px!important;--dsh-composer-dock-inset:4px!important}
  .wSkVaW_header{padding:calc(env(safe-area-inset-top,0px) + 8px) 10px 0 54px!important}
  .wSkVaW_tabs{gap:20px!important}
  .wSkVaW_crumb{max-width:120px!important}
  .wSkVaW_crumbCurrent{max-width:50vw!important}
  .wSkVaW_headerUtilities{margin-left:8px!important}
  .wSkVaW_headerActions{gap:4px!important}
  .wSkVaW_composerSeat{padding-bottom:env(safe-area-inset-bottom)!important}
  .uV2eYG_card{border-radius:18px!important;gap:8px!important}
  .uV2eYG_row{flex-wrap:wrap!important;gap:6px 8px!important;padding:2px 6px 6px!important}
  .uV2eYG_tools{gap:8px!important;min-width:0!important;flex:0 0 auto!important}
  .uV2eYG_modes{gap:8px!important;min-width:0!important}
  .uV2eYG_trailing{flex:0 1 auto!important;min-width:0!important;gap:8px!important;justify-content:flex-end!important}
  ._7KE1Ra_trigger{max-width:100%!important;min-width:0!important}
  /* rc6 ModelSelect: reasoning-effort badge doubles the trigger width on phones
     (GLM-5.3 + "Default" ≈ 102px) and squeezes the composer row into an ugly wrap.
     Hide the badge text on narrow screens — the effort is still selectable in the menu. */
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
  ._7KE1Ra_trigger{gap:2px!important;padding:0 2px 0 8px!important}
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
  .aionui-explorer-col,.aionui-preview-col{border-left:none!important}
  .aionui-explorer-handle,.aionui-preview-handle{display:none!important}
  /* live-stats TPS row + stats capsules stack 4 rows on phones: tighten
     capsules and the TPS line so the composer dock stays 2 rows max. */
  .FJxK0a_root{gap:2px 4px!important;padding:2px 4px 0!important}
  .FJxK0a_root>span:not(.FJxK0a_sep){padding:0 6px!important;font-size:10px!important;line-height:15px!important}
  [data-dsh-live-tps]{display:none!important}
  .Sxvs8a_root,.NM4-hq_text{overflow-wrap:anywhere;word-break:break-word}
  .FJxK0a_root{display:flex!important;flex-wrap:wrap!important;justify-content:center!important;gap:4px 6px!important;padding:4px 8px 2px!important;overflow:visible!important;line-height:16px!important}
  .FJxK0a_sep{display:none!important}
  .FJxK0a_root>span:not(.FJxK0a_sep){display:inline-flex!important;align-items:center!important;white-space:nowrap!important;padding:1px 8px!important;border-radius:999px!important;background:var(--dsw-alias-interactive-bg-hover,rgba(127,127,127,.10))!important;color:var(--dsw-alias-label-tertiary)!important;font-size:11px!important;line-height:16px!important}
  .FJxK0a_root>span:nth-of-type(1):not(.FJxK0a_sep){color:var(--dsw-alias-state-business-primary,#4d6bfe)!important;background:color-mix(in srgb,var(--dsw-alias-state-business-primary,#4d6bfe) 12%,transparent)!important}
  .FJxK0a_root>span:nth-of-type(3):not(.FJxK0a_sep){color:var(--dsw-alias-label-primary-bluish,#6d7dcc)!important;background:color-mix(in srgb,#a78bfa 13%,transparent)!important}
  .FJxK0a_root>span:nth-of-type(5):not(.FJxK0a_sep){color:#8a63d9!important;background:color-mix(in srgb,#7c9aff 13%,transparent)!important}
  .FJxK0a_root>span:nth-of-type(7):not(.FJxK0a_sep){color:var(--dsw-alias-state-success-primary,#2ea86a)!important;background:color-mix(in srgb,var(--dsw-alias-state-success-primary,#2ea86a) 12%,transparent)!important}
  .FJxK0a_root>span:nth-of-type(9):not(.FJxK0a_sep){color:var(--dsw-alias-state-warn-primary,#c2821c)!important;background:color-mix(in srgb,var(--dsw-alias-state-warn-primary,#c2821c) 12%,transparent)!important}
  .FJxK0a_root>span:nth-of-type(2n+11):not(.FJxK0a_sep){color:var(--dsw-alias-label-secondary,#5c6673)!important;background:color-mix(in srgb,var(--dsw-alias-label-secondary,#5c6673) 10%,transparent)!important}
  .pXSMma_headline{font-size:22px!important;line-height:28px!important;column-gap:8px!important;grid-template-columns:28px auto auto!important}
  .pXSMma_previewBadge{font-size:11px!important}
  .dshm-backdrop{position:fixed;inset:0;z-index:55;background:rgba(0,0,0,.45);display:none}
  body:has(#root div[style*='grid-template-columns']:not([data-sidebar-collapsed])) .dshm-backdrop,
  body[data-mob-panel='details'] .dshm-backdrop{display:block}
  .dshm-fab{
    position:fixed;top:calc(env(safe-area-inset-top,0px) + 8px);left:calc(env(safe-area-inset-left,0px) + 8px);z-index:70;
    width:40px;height:40px;display:inline-flex;align-items:center;justify-content:center;border-radius:12px;
    background:var(--dsw-alias-button-floating-fill,rgba(127,127,127,.18));color:var(--dsw-alias-text-primary,currentColor);
    border:1px solid var(--dsw-alias-border-l2,rgba(127,127,127,.2));box-shadow:0 2px 10px rgba(0,0,0,.20);
    cursor:pointer;-webkit-tap-highlight-color:transparent;touch-action:manipulation;padding:0;
  }
  body:has(#root div[style*='grid-template-columns']:not([data-sidebar-collapsed])) #dshm-fab-sidebar{background:var(--dsw-alias-color-accent,#4d8cff);color:#fff}
}
@media (max-width:640px){
  .VOzbGW_overlay{padding:0!important}
  .VOzbGW_panel{width:100%!important;max-width:calc(100vw - 12px)!important;height:min(800px,calc(100vh - 12px))!important;border-radius:14px!important;flex-direction:column!important}
  .VOzbGW_nav{width:100%!important;flex:none!important;flex-direction:row!important;align-items:center;gap:4px!important;padding:6px 6px!important;overflow-x:auto;overflow-y:hidden;border-bottom:1px solid var(--dsw-alias-border-l2)}
  .VOzbGW_navTitle{display:none!important}
  .VOzbGW_navList{flex-direction:row!important;gap:2px!important;flex-wrap:nowrap!important}
  .VOzbGW_navCell{white-space:nowrap!important;height:32px!important;padding:0 12px!important;flex:none!important}
  .VOzbGW_content{flex:1 1 auto!important;min-height:0!important}
  .zGbnIq_rowIdentity{flex:1 1 auto!important;min-width:0!important}
  .zGbnIq_rowName{min-width:0!important;max-width:100%!important;overflow:hidden!important;text-overflow:ellipsis!important;white-space:nowrap!important}
  .zGbnIq_rowActions{flex:none!important;white-space:nowrap!important}
  .zGbnIq_rowActions .zGbnIq_secondaryButton,.zGbnIq_rowActions .zGbnIq_dangerButton{flex:none!important;white-space:nowrap!important}
}
@media (max-width:380px){.pXSMma_previewBadge{display:none!important}}
.zGbnIq_rowTag{background:color-mix(in srgb,var(--dsw-alias-state-business-primary,#4d6bfe) 14%,transparent)!important;border-color:transparent!important;color:var(--dsw-alias-state-business-primary,#4d6bfe)!important}
.qSYn7G_configTag{background:color-mix(in srgb,var(--dsw-alias-label-primary-bluish,#6d7dcc) 13%,transparent)!important;color:var(--dsw-alias-label-primary-bluish,#6d7dcc)!important}
.At1oFq_badge{background:color-mix(in srgb,var(--dsw-alias-state-business-primary,#4d6bfe) 12%,transparent)!important;color:var(--dsw-alias-state-business-primary,#4d6bfe)!important}
.At1oFq_badgeMuted{background:color-mix(in srgb,var(--dsw-alias-label-secondary,#5c6673) 12%,transparent)!important;color:var(--dsw-alias-label-secondary,#5c6673)!important}
.rtSEdW_badge{background:color-mix(in srgb,var(--dsw-alias-label-secondary,#5c6673) 12%,transparent)!important;color:var(--dsw-alias-label-secondary,#5c6673)!important}
.Y0dWHa_kindTag{background:color-mix(in srgb,var(--dsw-alias-label-primary-bluish,#6d7dcc) 13%,transparent)!important;color:var(--dsw-alias-label-primary-bluish,#6d7dcc)!important}

/* ===== settings plugin cards ===== */
/* plugin-console (pc) and file-uploads selector rules were pruned in
   1.1.0: those plugins are not installed in this profile — verified by scanning
   every installed client bundle; the rules matched nothing. pbv/YyYd = rc6
   official settings (plugin-inventory page), still alive. */
@media (max-width:820px){
  /* rc6 settings tabs strip + plugin card footers */
  .pbvGtq_tabs{gap:14px!important;overflow-x:auto!important;scrollbar-width:none}
  .pbvGtq_tabs::-webkit-scrollbar{display:none}
  .YyYd_a_name{font-size:14px!important}
  .YyYd_a_description{font-size:12px!important}
  .YyYd_a_footer{flex-wrap:wrap!important;gap:6px!important;justify-content:flex-end!important}
  .YyYd_a_footer>*{flex:none!important;white-space:nowrap!important}
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

			// details-drawer state; sidebar drawer uses the SHIPPED layout state
			let detailsOpen = false;
			const setDetails = (open) => {
				detailsOpen = open;
				if (open) document.body.dataset.mobPanel = "details";
				else delete document.body.dataset.mobPanel;
			};

			const Hamburger = () => h("svg", { viewBox: "0 0 24 24", width: 22, height: 22, "aria-hidden": true, fill: "none" },
				h("path", { d: "M3 6h18M3 12h18M3 18h18", stroke: "currentColor", "stroke-width": 2, "stroke-linecap": "round" }));
	
			function MobileChrome() {
				const layout = ctx.get("layout");
				const sidebarOpen = () => {
					const f = document.querySelector("#root div[style*='grid-template-columns']");
					return !!(f && !f.hasAttribute("data-sidebar-collapsed"));
				};
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
				const onKey = (e) => { if (e.key === "Escape" && detailsOpen) setDetails(false); };
				document.addEventListener("click", onDocClick, true);
				document.addEventListener("keydown", onKey, true);
				return () => {
					document.removeEventListener("click", onDocClick, true);
					document.removeEventListener("keydown", onKey, true);
				};
			}, "dsh-mobile: inspect opens details"));

			ctx.effect(() => () => {
				disposers.splice(0).forEach((d) => { try { d(); } catch (e) {} });
				delete document.body.dataset.mobPanel;
			}, "dsh-mobile: teardown");
		}

		exports.apply = apply;
		return module.exports;
	}
});
