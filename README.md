# dsh-mobile-ui — DSH Web 移动端适配插件

[DSH](https://github.com/deepseek-ai) (DeepSeek Harness) Web GUI 的移动端响应式适配层。
以常驻 Cordis 客户端插件形式挂载在 web profile 上：手机浏览器（微信内置浏览器、
Safari、Chrome 等）打开页面即自动生效，桌面端布局完全不受影响，无需任何配置。

## 功能

- **单列布局**：桌面双栏（侧栏+主区）在窄屏下压成单列，内容区占满全宽
- **抽屉导航**：右下角 ☰ 悬浮按钮唤出会话侧栏，遮罩点击关闭，跟随官方
  `data-sidebar-collapsed` 状态，不自建状态机
- **工具详情抽屉**：点工具卡片"检查"按钮弹出底部详情抽屉（移动端无官方入口）
- **输入框防溢出**：composer 工具行/模型名自动换行收缩，不再挤爆一行
- **统计胶囊**：底部 token 统计按"组"着色显示，胶囊化排列不截断
- **安全区适配**：iOS 刘海/底部横条（`env(safe-area-inset-*)`）正确留白
- **禁 iOS 聚焦缩放**：输入控件统一 16px 字号
- **插件控制台中文化**：常用插件行内显示一句中文介绍

## 安装

方式一：插件控制台（推荐）——在 DSH Web 的插件控制台里按 GitHub 源安装本仓库。

方式二：手动安装到 profile：

```sh
cd ~/.dsh/profiles/web
pnpm add github:cloudfly-xiao/dsh-mobile-ui
```

然后在 `cordis.patch.yml` 里挂载：

```yaml
- insert:
    - id: mobile-ui
      name: 'dsh-mobile-ui'
```

重启 dsh web 后，手机访问即生效。

## 架构

```
lib/index.js    host 半边（空实现，仅占位——本插件纯客户端）
lib/client.js   client 半边（ModuleLoader 自注册格式）
                ├─ styles: MOBILE_CSS（全部适配样式，5 组媒体查询断点）
                ├─ shell.overlay 槽位: ☰/详情 FAB + 遮罩
                └─ document click 监听: 点工具"检查"→开详情抽屉
```

适配策略分两层：

1. **稳定钩子**（升级 dsh 一般不坏）：`data-sidebar-collapsed`、`data-slot='sidebar'`、
   `env(safe-area-inset-*)` 等语义化属性
2. **构建 hash 类名**（与 dsh 版本绑定，如 `.uV2eYG_*`）：跟随具体构建产物，
   升级 dsh 后可能失效，失效表现与自检方法见下文

## 兼容性

基于 dsh `0.1.0-rc.6` 的类名 hash 构建。升级 dsh 后若手机上出现布局回退
（输入框挤爆、统计变灰一行、侧栏变 56px 窄条等），说明 hash 已过期，
按下面方法刷新即可，核心布局钩子通常不受影响。

### 一键自检（hash 是否仍与线上 bundle 匹配）

```sh
node tests/run-tests.cjs        # 第 4/5 节报告 hash 存活情况
```

### 更新 hash

新版本 hash 藏在对应 `dsh-client-ui-*` 包的 `lib/client.js` 里。从
`.maps.txt` 式类名映射（`var X_default = { "logical": "hash" }`）中找到
逻辑名对应的新 hash 前缀，对 `lib/client.js` 中标注 `rc6` 的段落做整前缀
全局替换（如 `uV2eYG_` → 新值），避免逐条手改遗漏。

## 测试

```sh
node tests/run-tests.cjs
# 可选环境变量：
#   DSH_PKGS_DIR   指向 node_modules/@deepseek-ai（默认自动发现 ~/.npm/_npx）
#   DSH_BASE_URL   指向运行中的 dsh web（如 http://127.0.0.1:3080）启用第 6 节
```

## 已知坑（给想写同类插件的人）

1. **package.json 的 exports 会封装整个包**：必须保留 `"./package.json": "./package.json"`，
   否则客户端注册表 `require.resolve("<pkg>/package.json")` 被挡，插件被**静默跳过**
   （无报错、日志干净——最难查的一种失败）。
2. **client.js 必须是 `window.__ModuleLoader__.load({id, factory})` 自注册格式**，
   不是 ESM export；React 从 `require("react")` 取。
3. **nth-of-type 只数标签不看 class**：统计行的组 span 与分隔 span 交替，
   组落在奇数位——CSS 按奇数位着色，别按"第 N 个组"数。

## License

[MIT](./LICENSE)
