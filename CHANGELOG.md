# Changelog

## 1.1.0

收敛性维护版本：消除死代码、修复 details 抽屉失同步、补齐键盘体验与维护工具。
（历史说明：1.0.0 之后线上曾追加过自称 "v1.1" 的样式段——设置页插件卡 / plugin-console /
uploads——但从未升版本号；本版将其正式收编并修剪。）

### 移除（-8.5KB / -34%）
- zh 插件控制台装饰器：约 130 条 `pcZhDescriptions` 硬编码映射（7.3KB）+ 800ms 轮询
  定时器。经全量扫描（195 个官方包 + profile node_modules 递归），`pc_*` /
  `dsh-upload-*` 类在当前环境无任何生产者——dsh-plugin-console 与 dsh-file-uploads
  并未安装，整套功能为死代码。
- CSS 中 12 条 `.pc_*` / `.dsh-upload-*` 死规则、空掉的 `@media (max-width:480px)` 块、
  `.dshm-inspector` 孤儿选择器、`mobPanel0` 笔误残留与生产 console.log。

### 修复
- **details 抽屉失同步**：抽屉内官方关闭按钮（`.Y0dWHa_close`）清除选中后，
  `body[data-mob-panel='details']` 标志残留，抽屉停留在空面板上。现于捕获阶段镜像
  该按钮点击同步收起抽屉，并新增 Esc 键关闭。
  注：不能用 CSS `:not([data-details-collapsed])` 门控——该属性是派生值
  （`cols.details === 0`），窄屏下 `computeColumns` 恒输出 `details: 0`，
  属性恒在，门控会永久隐藏抽屉。

### 新增
- 横屏刘海安全区：FAB 补 `safe-area-inset-left`，侧栏抽屉补 `-left`、details
  抽屉补 `-right`（横屏刘海不再压住抽屉内容与菜单按钮）。
- viewport meta 补 `interactive-widget=resizes-content`：Android 软键盘弹出时视口
  正确收缩，composer 不再被键盘遮挡。
- `scripts/refresh-hashes.mjs`：dsh 升级后的一键哈希刷新 codemod（干跑报告 /
  `--write` 应用），存活 token 不动、唯一后继自动替换、多候选报告人工定夺。
- 测试：断言 4 个媒体断点；新增 `pbvGtq_` / `YyYd_` 前缀与 `Y0dWHa_close` 钩子
  存活检查；死选择器不回潮、viewport 补丁在位、关闭镜像 + Esc 在位。

### 归档
- 旧代插件 `dsh-plugin-mobile-ui/`（v0.x–v1.3，未安装）与实验脚本移入 `_archive/`；
  黑屏事故复盘 POSTMORTEM 副本保留于 `docs/POSTMORTEM.md`。

## 1.0.0
- 首个稳定版：单列布局 + 抽屉导航（跟随官方 `data-sidebar-collapsed`）+ 详情抽屉 +
  统计胶囊 + 安全区适配，基于 dsh 0.1.0-rc.6。
