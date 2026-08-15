# dsh-mobile-ui

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![dsh 0.1.0-rc.6](https://img.shields.io/badge/dsh-0.1.0--rc.6-6c5ce7.svg)](#兼容性)

DSH（DeepSeek Harness）Web GUI 的**移动端适配插件**：手机浏览器打开页面即得原生 App
般的单列对话体验，桌面端布局不受任何影响。零配置、零依赖、纯客户端注入。

专为**微信内置浏览器**与 Android/iOS 浏览器调校——在手机上挂着 DSH 服务、
随时随地用手机续写会话的场景而设计。

## 效果演示

| 微信内置浏览器 · 对话界面 | Via 浏览器 · 会话抽屉 |
|:---:|:---:|
| ![对话界面](docs/mobile-chat-wechat.jpg) | ![会话抽屉](docs/mobile-drawer-via.jpg) |
| 单列布局 · 统计胶囊 · 轨迹折叠 | ☰ 悬浮按钮唤出会话列表 |

左图：对话主界面自动单列化，底部统计行按"轮次/步数/LLM 耗时/工具耗时"分组
胶囊着色，工具轨迹折叠为时间行，输入区不再溢出。
右图：右下角 ☰ 悬浮按钮唤出会话侧栏抽屉，遮罩点击关闭。

## 功能特性

### 布局
- **单列布局** —— 桌面双栏（侧栏+主区）在窄屏压成单列，内容区占满全宽
- **抽屉导航** —— ☰ 悬浮按钮唤出会话侧栏，跟随官方 `data-sidebar-collapsed`
  状态，不自建状态机，与桌面端行为一致
- **工具详情抽屉** —— 点工具卡片"检查"按钮弹出底部详情抽屉（移动端无官方入口）
- **拖拽手柄隐藏** —— 触屏无处拖的分割条全部隐藏

### 输入区
- **防溢出** —— composer 工具行/模型名自动换行收缩，不再一行挤爆
- **禁 iOS 聚焦缩放** —— 输入控件统一 16px 字号
- **底部安全区** —— `env(safe-area-inset-bottom)` 正确留白，不再被手势条遮挡

### 观感
- **统计胶囊** —— 底部 token/耗时统计按组着色、胶囊化排列，小屏不截断
- **消息时间行** —— "时间 · 用时 · 首 token · 速率"整行收纳，不再溢出换行
- **各类标签着色** —— 工具标签、上下文注入标签等 6 处恢复语义配色
- **弹层居中** —— 定时任务等 flyout 菜单在窄屏居中弹出

### 中文化
- **插件控制台** —— 常用插件行内显示一句中文介绍，一眼看懂装了什么

## 安装

**方式一 · 插件控制台（推荐）**：在 DSH Web 的插件控制台中按 GitHub 源安装本仓库。

**方式二 · 手动安装**：

```sh
cd ~/.dsh/profiles/web
pnpm add github:cloudfly-xiao/dsh-mobile-ui
```

在 `cordis.patch.yml` 挂载：

```yaml
- insert:
    - id: mobile-ui
      name: 'dsh-mobile-ui'
```

重启 dsh web，手机访问即生效。验证：

```sh
curl -s -o /dev/null -w "%{http_code}\n" \
  "http://127.0.0.1:3080/plugins/dsh-mobile-ui/client.js"   # 期望 200
```

## 架构

```
lib/index.js    host 半边（空实现，仅占位——本插件纯客户端）
lib/client.js   client 半边（ModuleLoader 自注册格式）
                ├─ styles: MOBILE_CSS（全部适配样式，5 组媒体查询断点）
                ├─ shell.overlay 槽位: ☰/详情 FAB + 遮罩
                └─ document click 监听: 点工具"检查"→开详情抽屉
```

适配策略分两层，升级 dsh 时命运不同：

| 层 | 钩子示例 | 升级 dsh 后 |
|---|---|---|
| **稳定钩子** | `data-sidebar-collapsed`、`data-slot='sidebar'`、`env(safe-area-inset-*)` | 一般继续生效 |
| **构建 hash 类名** | `.uV2eYG_*`、`.FJxK0a_*` 等（跟随构建产物） | 可能失效，需刷新 |

## 兼容性与 hash 维护

基于 dsh `0.1.0-rc.6` 构建。升级 dsh 后若手机上出现布局回退（输入框挤爆、
统计变灰一行、侧栏变 56px 窄条、点"检查"无反应等），说明 hash 已过期：

```sh
node tests/run-tests.cjs     # 第 4/5 节报告 hash 存活情况
```

刷新方法：新 hash 藏在 `dsh-client-ui-*` 包的 `lib/client.js` 类名映射
（`var X_default = { "logical": "hash" }`）里，找到逻辑名对应的新前缀，
对 `lib/client.js` 中标注 `rc6` 的段落做**整前缀全局替换**
（如 `uV2eYG_` → 新值），避免逐条手改遗漏。

## 测试

```sh
node tests/run-tests.cjs
# 可选环境变量：
#   DSH_PKGS_DIR   指向 node_modules/@deepseek-ai（默认自动发现 ~/.npm/_npx）
#   DSH_BASE_URL   指向运行中的 dsh web（如 http://127.0.0.1:3080）启用运行时检查
```

42 项静态检查：包形状、client bundle 可执行性、CSS 完整性、hash 存活性、DOM 钩子。

## 已知坑（给想写同类插件的人）

1. **package.json 的 exports 会封装整个包**：必须保留 `"./package.json": "./package.json"`，
   否则客户端注册表 `require.resolve("<pkg>/package.json")` 被挡，插件被**静默跳过**
   （无报错、日志干净——最难查的一种失败）。
2. **client.js 必须是 `window.__ModuleLoader__.load({id, factory})` 自注册格式**，
   不是 ESM export；React 从 `require("react")` 取。
3. **nth-of-type 只数标签不看 class**：统计行的组 span 与分隔 span 交替，
   组落在奇数位——CSS 按奇数位着色，别按"第 N 个组"数。

## License

[MIT](./LICENSE) © [cloudfly-xiao](https://github.com/cloudfly-xiao)
