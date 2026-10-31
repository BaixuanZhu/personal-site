# OG 社交分享图生成与接入

## Goal

为根入口、首页、关于页与全部项目页生成并提交 1200×630 静态 PNG，接入 `og:image`/`twitter:image`，并提供本地重生成脚本与覆盖率/尺寸检查。

## Background

当前全站无 `og:image`；项目页曾使用 SVG 封面作为 OG（已移除）。静态导出下 `opengraph-image.tsx` 产出无扩展名文件，GitHub Pages 的 Content-Type 不可控，因此采用提交静态 PNG 的方案。

## Requirements

- 新增 `scripts/generate-og.mjs`：
  - 读取 `content/projects/{zh,en}/*.mdx`（gray-matter）与站点配置，生成 **19** 张 1200×630 PNG 到 `public/og/`：
    - `root.png`（根跳转分享图，中英通用）
    - `home-zh.png`、`home-en.png`
    - `about-zh.png`、`about-en.png`
    - `projects-zh.png`、`projects-en.png`（Wave 7 增补的项目索引页）
    - `project-{slug}-zh.png`、`project-{slug}-en.png`（各 6 个项目）
  - 使用系统 Chrome/Edge headless（`CHROME_PATH` 可覆盖；Windows 常见路径自动探测）对本地 HTML 模板截图；`--window-size=1200,630 --force-device-scale-factor=1 --hide-scrollbars`，完成后清理临时文件。
  - 设计遵循站点视觉：深色渐变背景、品牌名（朱柏轩 / Galaxy）、页面标题、描述/标签、站点地址；中文字体使用系统栈；文字不溢出，关键内容距边缘 ≥64px。
  - `package.json` 增加 `"og": "node scripts/generate-og.mjs"`；脚本需可重复执行且输出确定性。
- 新增 OG 地址助手（可放在 `lib/seo.ts`）：把 `/og/xxx.png` 转为带 `siteConfig.url`（含 basePath）的绝对 URL。
- 元数据接入：
  - `pageMetadata` 支持 `image`（路径 + alt），输出 `openGraph.images`（url/width=1200/height=630/alt/type=image/png）与 `twitter.images`。
  - 首页、关于页、项目页分别使用对应语言/项目的 PNG；项目页不再输出任何 SVG OG。
  - 根跳转页 `scripts/gen-root-redirect.mjs` 增加 `og:image`（绝对 `root.png`）与 `twitter:card`/`twitter:image`。
- 新增 `scripts/check-og.mjs`：
  - 校验 19 个文件存在、PNG 魔数、IHDR 宽高严格为 1200×630、单文件 <300KB。
  - 从内容目录推导项目图文件名，项目新增/删除时缺图或多图应失败。
  - `package.json` 增加 `"check:og"`，并入 `"check"` 与 `build`（在 `next build` 前执行）。
- 扩展 `scripts/verify-export.mjs`：所有索引页（首页/关于/项目）必须有唯一 `og:image` 与 `twitter:image`，均为绝对 `.png` 地址且指向存在的本地文件；根 `index.html` 含 og:image。
- 图片必须提交到仓库（`public/og/`），不依赖运行时生成。

## Dependencies

Wave 1（字体/系统中文栈）、Wave 2（lib/seo/pageMetadata/verify-export）已完成。与 Wave 3 并行，文件范围不重叠。Wave 7 会为项目索引页补充索引 OG 图。

## Acceptance Criteria

- [x] `public/og/` 含 19 张 PNG（17 张基础图 + 2 张索引页图），全部 1200×630、<300KB、PNG 格式。
- [x] `pnpm og` 可在本机重新生成全部图片，重复执行结果稳定。
- [x] 首页、关于页、12 个项目页的 HTML 均含唯一 `og:image` 与 `twitter:image`，为绝对 `.png` URL 且带 basePath。
- [x] 项目页不再出现 SVG `og:image`；根入口含 root.png 的 og:image 与 twitter card。
- [x] `pnpm check:og` 在缺图、尺寸错误、超 300KB 时失败。
- [x] `pnpm exec tsc --noEmit`、`pnpm lint`、静态导出、`pnpm verify:export` 全部通过。

## Out of Scope

- 项目索引页 OG 图（Wave 7）。
- 在 CI 中运行浏览器生成图片（只校验已提交产物）。
- 动态 ImageResponse。
