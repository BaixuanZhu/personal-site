# 站点全面优化：性能、SEO、可访问性与内容结构

## Goal

在不改变站点定位与视觉语言的前提下，完成 8 个可独立验收的优化批次：降低首访体积、补齐搜索与社交元数据、修复 404 与移动端问题、提升可访问性，并建立内容与 CI 护栏。

父任务只负责范围、依赖、验收与最终集成，不直接作为实现目标。

## Background

已确认的现状：

- 字体：117 个 `@font-face`，其中 101 个 Noto Sans SC 切片；导出字体资源约 4.9MB，首访约 1.03MB。
- SEO：全站无 canonical；首页无 `og:image`；项目页 `og:image` 为 SVG；About 继承首页 hreflang；sitemap 无 x-default。
- 404：`global-not-found` 是 5.5KB 的全内联样式页面，未继承设计系统；语言内 `not-found.tsx` 在静态导出中不产出。
- 内容：非法 frontmatter 仅 `console.warn` 后跳过；6 个项目全部 `featured: true`。
- 仓库统计：浏览器端请求 GitHub API，存在限流与第三方请求。
- 移动端：375px 下导航内容约 204px、可用约 174px，右侧「联系」被裁切。
- 根入口：约 445B 的 JS 跳转页，无描述、OG、theme-color。

## Scope

计划拆分为以下 8 个子任务；实际目录名在创建后回填。

| # | 子任务 slug | 交付物 | 依赖 |
|---|---|---|---|
| 1 | `content-ci-guardrails` | frontmatter schema + fail-fast、内容完整性检查、导出验收脚本、CI lint/content check | 无 |
| 2 | `fonts-a11y-foundation` | 移除 Noto Sans SC、系统中文栈、skip link、reduced-motion、color-scheme/theme-color、雷达图语义与焦点、图片 alt | 无（可与 1 并行） |
| 3 | `seo-metadata` | 元数据 helper、canonical/hreflang/x-default、按语言 og:url、标题含姓名、JSON-LD、sitemap、根跳转页元数据 | 1 |
| 4 | `not-found-mobile-header` | 品牌化 404、全局 404 主题与样式、移动端导航菜单、Hero 小屏断行 | 2 |
| 5 | `og-images` | 1200×630 静态 PNG、本地生成脚本、og:image/twitter:image 接入、覆盖率检查 | 1、2、3 |
| 6 | `repo-meta-refresh` | RepoMeta 服务端化、移除客户端 GitHub 请求、定时 repo-stats 刷新 | 1 |
| 7 | `projects-index-featured` | 全部项目索引页、首页精选 4 个、索引页 SEO/OG、sitemap | 3、5 |
| 8 | `docs-final-qa` | README 更新、全量验证、前后指标记录、集成审查 | 全部 |

依赖必须写入各子任务的 `prd.md` / `implement.md`，不能只靠父子树位置隐含。

## Default Decisions

执行前默认采用以下方案；如需调整，在对应子任务开始前修改：

- **字体**：移除 Noto Sans SC，中文使用系统栈（PingFang SC / Microsoft YaHei / Noto Sans CJK），保留 Inter + Geist Mono。
- **OG**：提交 `public/og/*.png` 静态文件，不走 `opengraph-image.tsx`。原因：静态导出下 ImageResponse 产物 URL 无扩展名，GitHub Pages 的 Content-Type 不可控。
- **精选策展**：首页展示 FileX、DevTools、jvm、Danbooru Tag MCP 共 4 个；其余项目进入全部项目索引页。
- **motion**：不移除；当前 39KB gz 换取的交互质感保留。
- **推送/部署**：每批仅本地验证；推送与部署需单独征求用户同意。

## Requirements

- R1：任何非法或缺失必填字段的 MDX 必须让构建失败，并指出文件与字段；中英项目 slug、日期、featured 状态保持一致；封面图、repo-stats 快照、OG 图缺失必须被检查发现。
- R2：字体资源体积显著下降，中文在 Windows/macOS 上正常渲染；全局可访问性基础项（skip link、减少动态效果、color-scheme、theme-color、雷达图语义、图片 alt）修复。
- R3：每个可索引页面都有唯一 canonical、正确的 zh/en/x-default hreflang、按语言区分的 `og:url` 与 `og:type`；标题包含中文名与英文名；首页/关于/项目页 JSON-LD 可解析；sitemap 含 x-default 与新索引页；根跳转页有可用于分享的元数据。
- R4：404 页继承站点设计系统、支持亮暗主题、提供中英回首页入口；移动端导航不再溢出且可键盘操作；Hero 在 320–414px 无异常断行。
- R5：首页、关于、项目、索引页均有 1200×630 PNG OG 图；文件名与页面一一对应；元数据使用绝对 `.png` 地址并带 basePath。
- R6：RepoMeta 不再在浏览器请求 GitHub API；静态 HTML 直接包含快照数据；定时任务能刷新快照并重新部署。
- R7：新增 `/zh/projects/`、`/en/projects/` 索引页；首页只展示 4 个精选；所有项目仍可从索引页到达；索引页有独立 canonical/OG/sitemap。
- R8：README 记录新脚本、OG 重生成流程、定时刷新、字体决策与 404/SEO 约定；最终验收覆盖 lint、内容检查、静态导出、导出验收、可访问性与响应式截图。

## Acceptance Criteria

- [x] 8 个子任务的验收标准全部满足。
- [x] `pnpm lint`、`pnpm check:content`、静态导出构建、`pnpm verify:export` 全部通过。
- [x] 字体媒体目录从约 4.9MB 降至 300KB 以内；首访字体传输降至 150KB 以内。
- [x] 每个可索引页面 canonical/hreflang/x-default/og:url/og:image 覆盖率 100%。
- [x] 项目页不再输出 SVG `og:image`；所有 OG 图为 1200×630 PNG 且 <300KB。
- [x] 浏览器端对 `api.github.com` 的请求为 0。
- [x] 375px 下无横向溢出；320/375/414/1440 截图验证通过。
- [x] 亮/暗主题、zh/en 两种语言、404 与根入口均无回归。
- [x] axe 无 critical/serious 问题；Lighthouse SEO/最佳实践达到项目设定目标。
- [x] README 与 Trellis 规范更新完成。
- [ ] 推送/部署前已获得用户明确同意，并核对线上结果。

## Completion Notes（2026-11-01）

- 8 个子任务已全部归档到 `.trellis/tasks/archive/2026-11/`；逐项证据见各子任务 PRD、`docs-final-qa` 的验收记录与 README「质量与验收」。
- 字体媒体 289,404 B（282.6KB，13 个 woff2）；首页首访字体 70.2KB；19 个 HTML、18 条 sitemap URL、19 张 OG PNG。
- axe 33 次扫描 0 critical/serious；Lighthouse 移动端首页 98/100/96/100、项目索引 77/100/96/100（Performance/A11y/BP/SEO）。
- 本轮未推送、未部署，故最后一项保持未勾选；`git push` 与 Pages 部署需用户明确同意后再执行并核对线上结果。

## Out of Scope

- 移除 motion 或重写动画体系。
- 全站视觉重设计、品牌换肤、页面信息架构大改。
- 新增项目正文或重写个人介绍。
- 引入服务端运行时、数据库、动态 API。
- 迁移托管平台、接入分析/监控服务。
- 自动推送或自动部署（定时刷新部署除外，需单独确认）。

## Constraints

- 必须兼容 `output: "export"`、`trailingSlash: true`、GitHub Pages 子路径 `basePath`。
- 不引入重量级依赖；优先使用现有 Next/React/Tailwind/Radix/motion 能力。
- 遵循 Next.js 16 本地文档；修改前确认静态导出限制。
- 保持现有设计令牌与视觉语言，不因优化引入第二套样式体系。
- 每批可独立构建、验证、回滚；不跨批混入无关改动。
- 禁止 force push、跳过 hooks、未经确认的部署。

## Notes

- 父任务为协调任务，通常不执行 `task.py start`；由子任务承载实现。
- 每个复杂子任务开始前需具备 `prd.md`、`design.md`、`implement.md`，并按平台要求整理 `implement.jsonl` / `check.jsonl`。
- 依赖关系写入子任务文档；父任务负责最终跨子任务集成审查。
