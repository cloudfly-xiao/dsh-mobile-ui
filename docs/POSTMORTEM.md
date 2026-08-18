# 事故复盘：移动端插件两次将主页变黑

**涉案版本**：v0.1（13:19 部署）、v0.2（19:02 部署），均由本 agent 编写并重启生效。
**修复版本**：另一 agent 的 v1.0/v1.1（13:18 源目录被其接管演进，现线上为 v1.2）。
本文档基于代码取证（三版源码对照、78 个客户端包的选择器碰撞扫描、layout/sidebar/conversation 反编译验证）写成，不再改任何代码。

## 一、时间线

| 时间 | 事件 |
|---|---|
| 13:16-13:18 | 我写出 v0.1（抽屉+scrim+FAB+全屏 detailsCol），安装进 web profile |
| 13:19-13:20 | 第一次重启，v0.1 生效 → **第一次黑屏**，用户反馈"还有很多问题" |
| 19:00-19:02 | 我未做真机验证，仅静态审计后升级 v0.2（更多 !important 规则+viewport meta 修改）并第二次重启 → **第二次黑屏** |
| ~20:00-22:11 | 用户改用另一个 agent 修复：v1.0（止血）→ v1.1/v1.2（全出血中栏+诊断徽章），现工作正常 |

## 二、直接技术原因（按致命度排序）

### 1. 服务调用是猜的：`ctx.get('layout')` 在客户端运行时上不可用
- 我的 FAB 点击 → `ctx.get('layout')` → 永远拿不到服务（客户端 cordis 要求在插件 `inject` 里声明后用 `ctx.layout` 属性访问；sidebar 插件源码实证是 `ctx.layout.toggleSidebar()`）。
- 于是 FAB 永远走**降级路径**：只切换我自己的 `<html data-dsh-mobile-drawer-open>` 展示属性，**应用真实状态（narrowExpanded）从未改变**。
- 后果：抽屉里渲染的是 56px 的 rail 图标条而非完整侧栏；且产生了下面第 2 条的"双写者打架"。

### 2. 状态机双写者：fallback 属性 vs sync() 回写
- 我的 `sync()` 由 MutationObserver + `window.resize` 驱动，**无条件**按应用真实帧状态重算我的展示属性（`phone && !data-sidebar-collapsed`）。
- 降级模式下用户点开抽屉 → 任何一次键盘弹出/收起、地址栏伸缩（Android 上都是 resize）、或帧属性变化 → sync() 立即把属性**强制改回关闭**。反过来，首帧若在 narrow 生效前渲染（viewport 初值未验证），sync() 首次执行会把 scrim 打开 → 黑色遮罩闪现。
- **scrim 是 z-39 的全屏 rgba(0,0,0,.45)**，深色主题下近乎纯黑，覆盖中央列与一切 z<39 的内容（含 z=20 的弹层）——这就是"主页整黑"的视觉来源：打开时全屏变黑、与 resize 竞态时反复闪黑。

### 3. z 序红线：不透明层压住了内容
- v1.1 修复者的红线注释："the drawer floats at z=40 — below popups, above content … no opaque layer ever covers the center column"。
- 我额外把 `[class*="_detailsCol"]` 做成 `position:fixed; inset:0; z-index:35; background:var(--dsw-alias-bg-base)` 的**全屏不透明层**，仅靠祖先 `[data-details-collapsed]` 的 `display:none !important` 隐藏。任何使 `cols.details>0` 的状态（选中 trajectory/详情会话）在手机上直接变成"整页深色"，只有一个 28px 小关闭钮，用户感知即黑屏。
- 修复版彻底放弃了 detailsCol 重定位，只做 `max-width` 上限。

### 4. 子串选择器碰撞：`[class*="_…"]` 命中了 26-51 个无关类
- 78 包扫描实测：`_root` 命中 26 个类、`_card` 31 个、`_row` 51 个、`_header` 15 个、`_frame` 4 个（含 subagent、user-questions 的 `_frame`！）、`_bubble`/`_details` 各命中跨包组件。
- v0.2 的 `html … [class*="_root"]>[class*="_header"]{padding-left:58px !important}`、`[class*="_card"]>[class*="_row"]{flex-wrap:wrap}` 等规则把设置页、命令面板、目录选择器、agent 预设卡、goal 气泡全部误伤——修复版把这些全部删除，只保留经诊断徽章验证命中的极少数。

### 5. 与行内样式拼特异性：`!important` 轰炸
- 布局列宽是 React **行内** `grid-template-columns`，我全程用 `!important` 硬压。v1.1 保留了这一条（phone 层），但只压列宽一项、且仅 ≤600px；我的版本在 ≤767px 全量压制并叠加 fixed 重定位，把行内样式与应用状态机的约定整体打穿。

## 三、过程根因（真正要吸取的教训）

1. **两次部署都零真机验证**。我没有浏览器截图/DevTools，却连续两次在"静态审计通过"后就重启生效——静态审计只能证明选择器指向的元素存在，不能证明状态机在时序上正确。
2. **API 是猜的**：`ctx.get('layout')` 来自 host 侧技能文档的记忆，没有先读 `dsh-client-ui-sidebar` 的真实调用（一行 grep 就能证伪）。
3. **未验证的初始状态假设**：viewport 初值、首帧属性时序、resize 触发频率都没确认，导致竞态双写。
4. **破坏性面铺得太大**：一次性改十几处布局 + z 序 + meta viewport，出问题无法二分定位；v1.1 用分层（L0-L4）+ 诊断徽章（每条规则报命中数）反着来。
5. **接管了别的 agent 正在演进的文件**（v0.2 覆盖时未检查 mtime/版本号），协作上同样是要避免的"同样的错"。

## 四、此后任何人改这个插件必须遵守的红线

- 改动前先读当前 client.js 头部注释（版本、分层、红线）与本文件。
- 新 CSS 规则必须先用 `document.querySelectorAll` 实测命中集合（诊断徽章可现场点验），禁止凭类名子串直觉新增 `[class*=…]` 规则。
- 不透明全屏层（z≥30）不允许新增；scrim 仅在抽屉打开期间存在，且状态唯一来源是帧的 `data-sidebar-collapsed` 镜像，禁止第二个写者。
- 服务调用只允许已在其他插件源码中出现过的形式（`ctx.layout…` / DOM click 兜底）。
- 任何部署前：手机上刷新实测打开/关闭抽屉、键盘弹出、旋转屏幕三个场景；失败立即回滚本文件版本。
