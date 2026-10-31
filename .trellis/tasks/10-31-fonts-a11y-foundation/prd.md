# 字体瘦身与全局可访问性基础

## Goal

移除体积过大的 Noto Sans SC，改用系统中文栈；同时修复全站基础可访问性、减少动态效果、主题色与雷达图语义问题。

## Requirements

- 从 `app/[lang]/layout.tsx` 移除 `Noto_Sans_SC` 及字体变量；`app/globals.css` 的 `--font-sans`/`--font-heading` 移除 Noto，保留 Inter + 系统中文栈（PingFang SC、Microsoft YaHei、Noto Sans CJK SC 等）。
- 在 `[lang]` 布局增加 skip link 与 `viewport`（`themeColor` 亮/暗、`colorScheme`）；字典增加本地化 skip 文案。
- 首页、关于页、项目页的 `<main>` 增加 `id="main"` 与 `tabIndex={-1}`，保证 skip link 可聚焦。
- `app/globals.css` 增加 `color-scheme`；`scroll-behavior: smooth` 仅在 `prefers-reduced-motion: no-preference` 下生效。
- 雷达图 SVG 父级改为 `role="group"`，焦点顶点 aria-label 改为语言中立的 `label: value/100. description`；焦点可见；屏幕阅读器列表去掉中文标点依赖。
- 项目卡片预览图改为装饰性 `alt=""`；项目详情页大图同样改为装饰性，避免与标题重复播报。

## Dependencies

无；可与 Wave 0 并行。必须早于 404、OG 与最终验收。

## Acceptance Criteria

- [ ] `out/_next/static/media` 从约 4.9MB 降到 300KB 以内。
- [ ] 构建产物 CSS 中不再存在 Noto Sans SC 的 `@font-face`。
- [ ] 中英文 375/1440 截图中文渲染正常，无布局错乱。
- [ ] 键盘 Tab 第一个焦点为 skip link，激活后跳到 `#main`。
- [ ] 开启 reduced-motion 后页面不执行平滑滚动。
- [ ] 英文页雷达图 aria-label 不含中文；焦点顶点有可见指示。
- [ ] `pnpm lint` 通过。

## Out of Scope

- 移动端导航菜单、404 视觉重设计（由 not-found-mobile-header 负责）。
- OG 图与 SEO 元数据。
