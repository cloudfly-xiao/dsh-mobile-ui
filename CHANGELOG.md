# Changelog

## 1.4.12

better-sidebar 右上角集群对齐左侧 FAB：按钮从 28px 圆形改为 40px 圆角方形（同
浮动底色/边框/投影/22px 图标），角落偏移镜像 FAB（top safe+8 / right 8）；集群
展开态收起时头部让出右距 104px，右对齐按钮不再与集群重合（沿用其桌面 78px
手法的放大版）。

## 1.4.11

Session log 下载胶囊宽度修正：rc6 样式带 `min-width:111px`，光改文案（1.4.10）
盒子不缩。手机层去掉宽度下限并收紧内距，按钮随内容收缩。

## 1.4.10

头部文案：工具区里 dsh-session-log-export 的 "Session log" 下载胶囊在手机上太长，
移动层重写为 "Log"（精确匹配文本节点、幂等，React 重渲染后观察器自动再改回；
桌面端 ≥821px 不受影响）。

## 1.4.9

修正 1.4.8 误伤：`headerActions`（会话操作按钮槽）其实渲染在 `titleCluster`
**内部**，藏整个 cluster 会连按钮一起干掉。改为只藏面包屑导航
（`.wSkVaW_crumbs`），cluster 与按钮保留，按钮仍靠右与工具区相邻。

## 1.4.8

主聊天头部改为**直接隐藏标题**（面包屑）：不再拆两行，工具与操作按钮独占单行
右对齐，tabs 行不动。（1.4.7 的两行方案被否，本版替换。）

## 1.4.7

主聊天界面头部：tabs 上方那行（面包屑+工具+操作按钮挤一行、还要给 FAB 让 54px）
拆成两行——面包屑独占第一行（宽度从 120px 放宽到 32vw），工具与操作按钮右对齐
挪到第二行；下方 会话/轨迹 tabs 行不动。

注：1.4.6（设置弹窗 tabs 两行）改错了位置，已 revert——用户要的是主聊天头部。

## 1.4.5

tabs 行并入面板内缩：撤掉 1.4.4 的 -10px 横向负边距，tabs 分隔线不再通宽到
面板边缘，而是与 10px 内边距环一起断开——面板内所有层（含 tabs）统一离边。

## 1.4.4

设置弹窗**面板内部**整体内缩：面板本体 10px 内边距（所有内容离圆角边框一圈，
此前只有 tabs 行与屏边留白，贴边感来自面板内层）；tabs 分隔线用 -10px 横向负边距
保持通宽不被内缩截断；内容列侧边 14px + 面板 10px = 官方原有的 24px 视觉边距。

## 1.4.3

设置弹窗留白：遮罩层 12px 内边距（此前近乎全贴边仅 6px），面板填充满留白后的
内容盒（`max-width:100%`，高度同步 `calc(100vh - 24px)`）；顶部分区导航条
内边距略增至 `8px 10px 6px`。

## 1.4.2

热修复：设置弹窗里除"外观"外其他项都不能设置（下拉全被压住）。

### 根因
1.4.1 把宿主列抬到 z:1200 让弹窗盖过 FAB——但官方 Select/Menu 原语是 **portal 到
body 的 z:100/101 浮层**：抬升后所有从设置面板里弹出的下拉都渲染在对话框之下，
看不见也点不到；"外观"用内联色板按钮不依赖 portal，所以唯独它能改。

### 修复
- 撤销 z 抬升：列回到 z:60，portaled 下拉（100/101）天然位于弹窗之上；
- 改为在弹窗打开期间 `display:none` 隐藏 FAB（z:70，原抬升的唯一目标），
  关闭后自动复现。backdrop（z:55）本就在弹窗之下，无需处理。

## 1.4.1

修复：侧栏抽屉内点"设置"，弹窗被困在 340px 抽屉盒里（应相对全屏）。

### 根因（两层困局）
官方设置弹窗 `.VOzbGW_overlay`（`position:fixed; inset:0; z-index:1000`）**没有走
portal**，直接内联渲染在侧栏列 DOM 子树里；而抽屉列一直挂着 transform：
1. transform 祖先是 fixed 后代的**包含块** → `inset:0` 只解析到抽屉盒（340px），
   弹窗看起来被塞进抽屉；
2. 抽屉列 `z-index:60` 自成**层叠上下文** → 即使包含块修好，弹窗的 z:1000
   仍被压在 FAB（z:70）与 portaled 浮层（z:1000/1100）之下。

### 修复
- 抽屉**开启态**改用 `transform:none`（关态仍 `translateX(±106%)`）：none 不建立
  包含块/层叠上下文；none ↔ translate 按单位矩阵插值，滑动动画不变。
- 帧镜像新增内嵌全屏浮层探测（`.VOzbGW_overlay` 出/入抽屉列时置/清
  `body[data-mob-embed-overlay]`），命中时把宿主列抬到 `z-index:1200`，
  弹窗回到全局最上层；关闭设置后自动回落。details 抽屉同享两处修复。
- 测试 +3 项守卫（开启态 transform:none / 内嵌浮层抬升 / JS 探测接线）。

### 随版适配（dsh rc.8 · dshmarket 1.16 · aionui-panel 0.2.7）
- 官方构建升级到 `0.1.0-rc.8` 后全量复检：client.js 全部 hash token 存活
  （rc.8 沿用 rc.6 的内容哈希种子），无需刷新。
- dshmarket 1.12 → 1.16：市场类 `eGUBIq_*` 全部存活（注意其 client 入口已从
  lib/client.js 移到 client/client.js）；挂宿主 shell Modal 的 4 条安装弹窗规则已死
  （该组件在 rc.8 shell / dshmarket 1.16 中不再挂载），剪除。
- aionui-panel 0.2.7：explorer 列改名 `.aionui-panel`、两个拖拽 handle 类已删，
  相应修剪/跟进攻选择器（`.aionui-preview-col` 存活保留）。
- `refresh-hashes.mjs` 语料加固：并入 profile 第三方插件语料（`DSH_PROFILE_DIR`，
  排除自身）。此前只扫 @deepseek-ai，会把第三方 token"自信地"误配到恰好同名的官方类
  （实测：dshmarket titleRow → 会话头 wSkVaW_titleRow）——本次干跑即被拦；合并语料
  后此类 token 正确报 ALIVE 或 AMBIGUOUS，绝无静默误替换。
- 测试新增第三方钩子活性节（扫 profile 语料：eGUBIq/aionui/live-tps）与 shell-Modal
  死 scope 回潮守卫。

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
