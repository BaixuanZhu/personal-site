# 品牌化 404 与移动端导航修复

## Goal

让 404 页继承站点设计系统与亮暗主题、提供中英回首页入口；修复 320–414px 下导航溢出与 Hero 断行，并保证移动菜单可键盘操作。

## Background

当前 `app/global-not-found.tsx` 是 5.5KB 全内联样式页面，未引入 `globals.css`、不跟随主题、无 `<title>`（导致 `pnpm verify:export` 失败）；`app/[lang]/not-found.tsx` 在静态导出中不产出，属死代码。375px 下导航内容约 204px、可用约 174px，右侧「联系」被裁切。

## Requirements

- `next.config.ts`：启用 `experimental.globalNotFound: true`，锁定全局 404 行为，避免未来 Next 版本回归。
- 重写 `app/global-not-found.tsx`：
  - 引入 `app/globals.css`，使用站点设计令牌（背景/前景/边框/主色/圆角）与响应式布局。
  - 返回完整 `<html lang="zh-CN">`/`<body>`；`<html>` 上通过内联脚本按 `localStorage.theme`（next-themes 默认键）或 `prefers-color-scheme` 添加 `dark` 类，避免主题闪烁；不依赖 `[lang]` 布局或 ThemeProvider。
  - 导出 `metadata`：标题含 404 与中英文站点名（如 `404 · 页面不存在 | 朱柏轩 (Galaxy)`）、description、`robots: noindex`；可导出 `viewport` 亮/暗 theme-color。
  - 内容：品牌标识（链接到 `/zh/`）、醒目的 404 数字/标题、中英双语说明、两个明确的回首页按钮（`/zh/`、`/en/`）、可选返回上一页；触控目标 ≥44px。
  - 不得引入 Noto Sans SC；使用系统字体栈。
- 删除 `app/[lang]/not-found.tsx`（静态导出不会产出，避免维护两套 404）。
- 移动端导航：
  - 新建 `components/shared/mobile-nav.tsx`（客户端组件），基于现有 `radix-ui` Dialog：Menu 触发按钮（`md:hidden`）、右侧抽屉、遮罩、关闭按钮、焦点陷阱/ESC/滚动锁定由 Radix 提供。
  - 复用 `NavLinks` 渲染导航项；点击任一项后关闭菜单；抽屉内显示语言切换与主题切换（或至少保留 Header 常驻的两个控件，不重复）。
  - Header：桌面导航 `hidden md:flex`；移动端只显示品牌 + 语言切换 + 主题切换 + 菜单按钮；320–414px 不横向溢出，不压缩品牌文字。
  - 字典新增菜单无障碍文案（如 `menu.open`/`menu.close`/`menu.label`），中英同步；不破坏既有键结构。
- Hero：调整小屏字号/断行（如 `text-3xl sm:text-4xl md:text-5xl lg:text-6xl` + `text-balance`），320–414px 无异常断行或横向滚动。
- 不改变桌面端视觉语言与导航信息结构。

## Dependencies

Wave 1（可访问性基础）与 Wave 2（SEO/站点名助手）已完成。与 Wave 4 并行，文件范围不重叠。Wave 3 完成后 `pnpm verify:export` 应整体通过。

## Acceptance Criteria

- [ ] `out/404.html` 含非空 `<title>`（含 404）、description、`robots=noindex`、亮/暗 theme-color，体积 >1000 字节。
- [ ] 404 页引入 globals.css，亮/暗主题与站点字体/令牌一致；中英回首页链接均指向 `/{locale}/`。
- [ ] `app/[lang]/not-found.tsx` 已删除，`notFound()` 调用不受影响。
- [ ] 320/375/414px 下 Header 无横向溢出，菜单按钮可打开/关闭抽屉，导航项可点击并关闭。
- [ ] 移动菜单可用键盘操作（Tab/Shift+Tab、ESC 关闭，焦点返回触发按钮）。
- [ ] Hero 在 320/375/414px 无异常断行与横向滚动。
- [ ] `pnpm exec tsc --noEmit`、`pnpm lint`、静态导出、`pnpm verify:export` 全部通过。

## Out of Scope

- OG 图与社交元数据（Wave 4）。
- 项目索引页（Wave 7）。
- 全站视觉重设计。
