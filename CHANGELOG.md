# Changelog

## 1.4.0

手机层全局隐藏滚动条。

- **全局去滚动条**：820px 断点下 `*` 一律 `scrollbar-width:none`（标准属性，
  Firefox / Chrome 121+ / Safari 18.2+）+ `*::-webkit-scrollbar{display:none}`
  （老微信 XWeb 等内核兜底），`!important` 压过插件自设的
  `scrollbar-width:thin`（如 dshmarket 截图条）。只隐藏视觉滑轨——触摸/滚轮
  滚动行为完全不变；桌面端 ≥821px 不受影响。
- 桌面滚动条在手机上既无用又占 8-15px 地沟宽度，还易被误认为可拖拽元素；
  会话列表/对话流/设置弹窗/市场页统一清爽。
- 清理：`.pbvGtq_tabs` 与 `.eGUBIq_tabs` 各自的 scrollbar-width/
  ::-webkit-scrollbar 声明并入全局规则，删除冗余。

## 1.3.0

新增 dshmarket（DSH 插件市场）页面的手机适配。市场渲染在设置对话框内，桌面布局
按 ~700px 内容宽设计；本版把它的五个标签页（逛一逛/主题/已装/备份/诊断）全部收进
单列手机层。市场类名为其 css-modules 作用域前缀 `eGUBIq_`（dshmarket@1.11.x），
宿主 Modal 弹窗为 shell 作用域 `_15u5s_`——两者都会随对应包升级漂移，
测试 4b 节与本文档共同看护。

### 新增
- **标签条横滑**：5 个 nowrap 标签在手机上溢出——改为横向滚动、隐藏滚动条、
  隐藏尾部 grow 占位符（与官方设置页 `.pbvGtq_tabs` 同款处理）。
- **搜索框占满**：固定 260px 的 `tabSearch` 改 100% 宽。
- **横幅换行**：环境修复/热榜/恢复提示横幅的文案 span 设 `min-width:0`，
  按钮装不下时落到下一行，长文案不再撑破容器。
- **卡片网格自适应**：插件/备份网格的 280px 列地板改为 `min(280px,100%)`，
  窄容器不再横向溢出；卡片内边距收紧。
- **已装行三件套换行**：`irow` 的来源/所有者/按钮 nowrap 三元组允许换行，
  长包名 `overflow-wrap:anywhere`。
- **备份核对行堆叠**：70%/30% 弹性双列在手机改为整行堆叠。
- **诊断元信息换行**：320px 省略号上限取消，键列 min-width 松绑。
- **安装/卸载弹窗近全屏**：宿主 Modal `min(380px,100%` 宽提到 100%、
  遮罩留白 24px→12px、高度按视口封顶（vh 兜底 + dvh 升级）、footer 允许换行。
- **回到顶部按钮避让安全区**：`bottom` 计入 `env(safe-area-inset-bottom)`。

### 测试
- 稳定钩子 +5（标签横滑/搜索占满/网格地板/已装行换行/弹窗全屏）；
- 新增 4b 节：校验已装 dshmarket bundle 中 `eGUBIq_` 作用域仍然存在（升级漂移看护）；
- 线上检查追加 v1.3 标记（`eGUBIq_tabs`）与 dshmarket client.js 200。

## 1.2.0

兼容性与渲染成本专项：去掉 CSS `:has()` 依赖、补滚动锁定与降级兜底。

### 变更
- **去 `:has()`**：抽屉列改由 JS 打 `[data-dshm-col=sidebar|details]` 标签，官方 sidebar
  状态经 MutationObserver 单向镜像到 `body[data-mob-sidebar-open]`。老微信 XWeb 内核
  （< Chrome 105 / Safari 15.4）此前遮罩与 FAB 激活态直接失效；同时消除了
  `body:has(div[style*=...])` 在每次样式重算上的全文档扫描开销。
  观察器 rAF 合帧，且只响应帧属性翻转/结构变化——会话流式输出期间零额外扫描。
- **滚动锁定**：任一抽屉打开时 `body[data-mob-lock]` 置 `overflow:hidden`，
  抽屉容器加 `overscroll-behavior:contain`，修 iOS 橡皮筋穿透/背景跟滚。
- **Esc 现在也能关侧栏抽屉**（此前只关 details）。

### 清理与兜底
- 删除两条被同特异性后声明整体遮蔽的死规则（FJxK0a_root 及其 span 的第一组
  gap/padding/font-size）；合并分裂两处的 `._7KE1Ra_trigger` 声明；两个
  `max-width:820px` 块合而为一。
- 6 条标签配色规则移入 820 断点——此前落在所有媒体查询之外，桌面端也被改色，
  与 README "桌面端不受任何影响"的承诺冲突。
- 每条 `color-mix()` 背景前补 rgba 字面量兜底（旧内核整条丢弃声明时仍有底色）。
- 移除常驻 `will-change:transform`（transform 过渡本身已触发合成层提升，常驻层白占
  低端机内存）与过时的 `-webkit-overflow-scrolling:touch`（iOS 13+ 无效）。
- 新增 `prefers-reduced-motion:reduce`：减弱动效用户关闭抽屉过渡动画。

### 新增
- **运行时 hash 自检**：加载 3 秒后探测 rc6 锚点类（composer 卡/会话头/统计行），
  全部缺失即 `console.warn` 提示运行 `scripts/refresh-hashes.mjs`；诊断状态暴露于
  `window.__dshMobileUi`。
- 测试套件 +10 项守卫（无 :has 残留/滚动锁/overscroll/reduced-motion/rgba 兜底配对/
  自检存在/线上副本新鲜度等），并移除早已不用的 `hHd-Xa_toggle` 陈旧钩子检查。

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
