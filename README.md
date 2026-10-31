# Personal Portfolio · 个人作品集

面试用个人作品集网站，简洁、大气、高级。**中英双语**（`/zh` 与 `/en` 独立路由，SSG 静态生成），支持亮/暗主题与移动端响应式。

## 技术栈（2026-10）

| 技术 | 版本 | 说明 |
| --- | --- | --- |
| Next.js | 16.4（App Router + Turbopack） | 要求 Node.js ≥ 20.9；CI 使用 Node 24 |
| React | 19.3 | — |
| Tailwind CSS | v4.3 | CSS-first 配置（`app/globals.css` 中 `@theme`），无 tailwind.config |
| shadcn/ui | CLI v4 | Radix 基座 + Nova 预设，组件在 `components/ui/` |
| motion | 13.x | 即更名后的 Framer Motion（`import { motion } from "motion/react"`） |
| next-mdx-remote-client | v2 | 原 next-mdx-remote 的维护 fork，渲染 `content/` 下的 MDX |
| shiki + @shikijs/rehype | v4 | 构建期代码高亮，零运行时 JS |
| next-themes | 0.4 | class 策略亮/暗主题 |
| zod | v4 | 构建期严格校验项目 frontmatter（未知字段直接失败） |
| pnpm | 11.8 | `packageManager` 字段固定版本 |

## 快速开始

```bash
pnpm install
pnpm dev             # 开发：http://localhost:3000（自动跳转 /zh 或 /en）
pnpm build           # 生产构建：先跑 check-content + check-og，再 next build
pnpm start           # 启动 Node 生产服务器（仅非 export 构建）
pnpm lint            # ESLint
pnpm check           # lint + check:content + check:og，提交前一次跑完
pnpm check:content   # 校验中英项目 slug/date/featured 一致性、封面图与 repo-stats 覆盖
pnpm check:og        # 校验 public/og/ 的文件集合、1200×630 尺寸与单张 <300KB
pnpm verify:export   # 静态导出验收（需先完成 NEXT_OUTPUT=export 构建）
pnpm og              # 用本机 Chrome/Edge 重新生成 19 张 OG PNG（产物需提交）
pnpm repo-stats      # 刷新 lib/repo-stats.json 仓库统计快照
```

`pnpm build` 已内置 `check-content` 与 `check-og`：frontmatter、封面图、repo-stats 快照或 OG 图不合规时会在 `next build` 之前失败，不会产出半成品。

## 目录结构

```
app/
  [lang]/                  # 多语言路由（zh / en 两种参数全部 SSG）
    layout.tsx             # 根布局：<html lang> 随语言变化，注入字典与站点元数据
    page.tsx               # 首页（英雄区/精选项目/技能/关于摘要/联系）
    about/page.tsx         # 关于我完整页
    projects/page.tsx      # 项目索引：列出当前语言全部项目（含未精选）
    projects/[slug]/       # 项目详情页（MDX 渲染 + JSON-LD + 分享图）
  global-not-found.tsx     # 全局 404：experimental.globalNotFound: true 启用；
                           # 独立于 [lang] 布局，自行引入 globals.css 并内联恢复主题
  sitemap.ts               # sitemap.xml（18 URL：2 首页 + 2 关于 + 2 项目索引 + 12 项目页）
  robots.ts                # robots.txt（指向 sitemap）
proxy.ts                   # Next 16 请求代理：语言协商重定向（取代 middleware.ts）
components/
  sections/                # 首页各区块（文案由字典 props 注入）
  shared/                  # Header/Footer/MobileNav/语言切换/主题切换/项目卡片/RepoMeta 等
  ui/                      # shadcn/ui 组件
lib/
  config.ts                # 与语言无关的配置：姓名/邮箱/社交链接/导航/部署子路径
  seo.ts                   # canonical/hreflang/pageMetadata/absoluteUrl/Person JSON-LD
  projects.ts              # zod 严格校验 frontmatter，按语言读取项目（日期倒序）
  repo-stats.json          # pnpm repo-stats 生成的构建期统计快照
  shiki-theme.ts           # 构建期代码高亮主题（基于 vitesse-black 修正低对比 token）
  i18n/
    config.ts              # 语言清单、Locale 类型、日期本地化
    dictionaries.ts        # getDictionary(locale)
    dictionaries/zh.ts     # 中文字典（结构基准 Dictionary 类型）
    dictionaries/en.ts     # 英文字典（结构必须与 zh 完全一致）
content/
  projects/
    zh/                    # 6 个中文项目 MDX（filex/danbooru-tag-mcp/jvm/agent-skills/devtools/claude-code-hooks）
    en/                    # 6 个英文项目 MDX（与 zh 同 slug、同 date、同 featured）
public/
  favicon.ico              # 站点图标（由 [lang] 布局与 404 元数据显式引用，带 basePath）
  images/projects/         # 项目预览图（1200×750 SVG，中英各一版 + placeholder）
  og/                      # 19 张 1200×630 PNG（pnpm og 生成，提交入库）
scripts/
  check-content.mjs        # 内容一致性校验（build 前置）
  check-og.mjs             # OG 文件集合/尺寸/体积校验（build 前置）
  generate-og.mjs          # 本机 Chrome/Edge 生成 OG 分享图
  verify-export.mjs        # 静态导出验收（页面/SEO/sitemap/robots/根跳转页）
  fetch-repo-stats.mjs     # 扫描 MDX 的 github 地址，刷新仓库统计快照
  gen-root-redirect.mjs    # 静态导出时生成根跳转页（替代 proxy 语言协商）
```

## 多语言机制

- **路由**：所有页面在 `app/[lang]/` 下，构建期为 `zh`/`en` 全量 SSG（`generateStaticParams` + `dynamicParams = false`）。
- **入口协商**：根 `proxy.ts` 把无语言前缀的请求 307 到偏好语言。优先级：`NEXT_LANG` Cookie（用户显式切换过）> 默认 `zh`；不侦测 `Accept-Language`，未表达偏好的访客一律进入中文站。纯静态托管没有代理，由 `scripts/gen-root-redirect.mjs` 生成功能一致的跳转页。
- **切换器**：Header 中的「中 / EN」按钮组，切换时保留当前路径（如 `/zh/about → /en/about`）并写 Cookie 记忆偏好。
- **文案**：UI 文案全部在 `lib/i18n/dictionaries/`，`zh.ts` 是结构基准（`Dictionary` 类型），`en.ts` 必须保持相同键结构。
- **内容**：项目正文按语言放在 `content/projects/{zh|en}/<slug>.mdx`，同 slug 双语互为 hreflang 备选；`/zh/projects/`、`/en/projects/` 是全部项目的索引入口。

## 内容维护指南

站点已填充真实个人信息与 6 个开源项目。日常更新入口：

1. **个人信息**：`lib/config.ts`（姓名/邮箱/GitHub）+ `lib/i18n/dictionaries/{zh,en}.ts`（自我介绍、技能矩阵、关于页文案）。
2. **项目内容**：编辑 `content/projects/{zh,en}/<slug>.mdx`。frontmatter 由 `lib/projects.ts` 的 zod `strictObject` 校验：`title`、`description`、`date`（带引号的 `YYYY-MM-DD`）必填，`tags`/`metrics`/`image`/`github`/`demo`/`featured` 按固定类型解析；**未知字段、类型错误或非法日期都会让构建失败**。两语言保持相同 slug、date 与 featured。
3. **精选策略**：`featured: true` 恰好 4 个/语言——FileX、Danbooru Tag MCP、jvm、DevTools。首页只展示这 4 个；`agent-skills` 与 `claude-code-hooks` 为 `featured: false`，仍可通过 `/zh/projects/`、`/en/projects/` 访问，但不进首页网格。数量变化需同步 `scripts/check-content.mjs` 与首页布局。
4. **提交前检查**：`pnpm check:content` 校验中英 slug 集合、date/featured 一致性、必填字段、封面图是否存在于 `public/`、每个 `github` 仓库是否有 `lib/repo-stats.json` 快照；任一问题非零退出。
5. **项目配图**：`public/images/projects/*.svg`（1200×750 终端卡片风格，中英各一版；`placeholder.svg` 是缺少 image 时的兜底）。frontmatter 中写 `/images/...`，渲染时由 `withBasePath` 拼接部署前缀，不要在 MDX 里手写 `/personal-site`。
6. **YAML 细节**：description 含英文冒号时必须用引号包裹；`metrics` 的 `label`/`value` 必须是字符串。
7. **仓库统计**：内容定稿后运行 `pnpm repo-stats`（可选 `GITHUB_TOKEN=$(gh auth token) pnpm repo-stats` 降低匿名 API 限流风险），刷新 `lib/repo-stats.json`。单个仓库拉取失败时保留旧值。

## 社交分享图（OG）

- **产物**：`public/og/` 下 19 张静态 PNG——`root.png`、`home-{zh,en}.png`、`about-{zh,en}.png`、`projects-{zh,en}.png`，以及 6 个项目 × 2 语言共 12 张 `project-<slug>-<lang>.png`。
- **生成**：`pnpm og` 用本机无头 Chrome/Edge/Chromium 截取纯内联 CSS 的静态 HTML 模板；自动探测常见安装路径，可用 `CHROME_PATH` 指定浏览器。输出固定 1200×630、单张 <300KB，同一内容重复生成结果稳定。
- **提交**：生成结果直接提交到仓库；CI 不安装浏览器，只校验产物（`pnpm check:og`），因此内容或项目增删后必须本地重新 `pnpm og` 并提交。
- **校验**：`pnpm check:og` 从 `content/projects/` 推导期望文件名，要求文件集合**完全一致**（缺图与多余 `.png` 都失败），并检查 PNG 魔数、IHDR 尺寸严格为 1200×630、单文件 <300KB。
- **引用**：页面通过 `lib/seo.ts` 的 `pageMetadata` / `ogImageUrl` 输出绝对 `.png` URL（含部署子路径）；根跳转页也带 og/twitter 元数据（`root.png`）。不输出 SVG `og:image`，也不使用 `opengraph-image.tsx`。

## 主题定制

设计令牌集中在 `app/globals.css` 的 `@theme inline` 区块（主色、圆角、字体变量）；MDX 排版由 `@tailwindcss/typography` 提供，暗色覆盖也在同文件。Inter 与 Geist Mono 由 `next/font` 注入，中文回退系统 CJK 字体栈（见下节）。

新增组件：`pnpm exec shadcn add <component>`。

## 约定与架构

- **字体**：已移除 Noto Sans SC 的字体分片（原字体媒体约 4.9MB 的来源），正文/标题使用 Inter + 系统中文栈（PingFang SC → Microsoft YaHei → Noto Sans CJK SC），等宽使用 Geist Mono；中文不再下载 webfont。
- **移动端导航**：`md` 以下隐藏桌面导航，改用基于 Radix Dialog 的右侧抽屉（`components/shared/mobile-nav.tsx`），焦点陷阱、ESC 关闭、滚动锁定与遮罩关闭由 Radix 提供；语言/主题切换保留在 Header。
- **SEO**：`lib/seo.ts` 统一生成 canonical、hreflang（zh/en，`x-default` 固定指向 zh）与 `pageMetadata`（完整 openGraph + twitter）；`[lang]` 下每个页面（首页/关于/项目索引/项目详情）都必须提供独立的 canonical 与 `og:image`，项目页 `og:type` 为 `article`，其余为 `website`。JSON-LD 按页面类型输出：首页 Person + WebSite，关于页 ProfilePage，项目索引 CollectionPage，项目详情 SoftwareSourceCode。
- **全局 404**：`app/global-not-found.tsx` 由 `next.config.ts` 的 `experimental.globalNotFound: true` 显式启用；它不经过 `[lang]` 布局，因此自行引入 `globals.css`，用内联脚本在首次绘制前恢复主题，并以中英双语展示。
- **静态导出**：`NEXT_OUTPUT=export` 时启用 `output: "export"`、`trailingSlash: true` 与 `images.unoptimized`；`next/link` 自动带 basePath，原生 `<a>` 与元数据需经 `withBasePath` / `siteConfig.url` 拼接。
- **代码块**：Shiki 在构建期用 `lib/shiki-theme.ts` 的 `vitesse-black` 派生主题高亮，标点/注释色已提亮到纯黑底上 ≥4.5:1；语言标签使用 `text-white/60`；无语言标注的代码块同样可通过键盘聚焦横向滚动。
- **仓库统计**：`RepoMeta` 为服务端组件，只读构建期快照，浏览器端不再请求 `api.github.com`。

## 构建与部署

### 环境变量

| 变量 | 作用 | 示例 |
| --- | --- | --- |
| `NEXT_OUTPUT` | 设为 `export` 时启用 `output: "export"` 静态导出 | `export` |
| `NEXT_PUBLIC_BASE_PATH` | 子路径部署前缀，同时写入 `basePath` / `assetPrefix` | `/personal-site` |
| `NEXT_PUBLIC_SITE_URL` | 站点绝对地址，用于 canonical、sitemap、OG | `https://baixuanzhu.github.io/personal-site` |
| `BASE_PATH` | 仅 `gen-root-redirect.mjs` 使用，与 `NEXT_PUBLIC_BASE_PATH` 保持一致 | `/personal-site` |
| `SITE_URL` | 可选，脚本生成 OG、根跳转页与导出验收时优先使用的站点地址 | `https://baixuanzhu.github.io/personal-site` |
| `GITHUB_TOKEN` | `pnpm repo-stats` 请求 GitHub API 时携带；CI 由 Actions 自动提供 | `gh auth token` 的输出 |

### 本地检查与构建

```bash
pnpm check   # 先过 lint + 内容 + OG 检查
pnpm og      # 仅当项目内容或 OG 模板变化时，重新生成并提交 public/og/
pnpm build
```

`pnpm build` 的检查链固定为 `check-content → check-og → next build`，无需手动串联。

### GitHub Pages（默认）

`.github/workflows/deploy.yml` 在推送 `main`、手动触发或每周定时任务时执行静态导出并发布。CI 顺序：**install → lint → repo-stats 刷新（`GITHUB_TOKEN` 由 Actions 注入）→ check:content → build（内部再跑 check-content + check-og）→ gen-root-redirect → verify:export → 上传 `out/` → deploy**。根跳转页必须在 `verify:export` 之前生成，否则缺少 `out/index.html` 会直接失败。

```bash
NEXT_OUTPUT=export \
NEXT_PUBLIC_BASE_PATH=/personal-site \
NEXT_PUBLIC_SITE_URL=https://baixuanzhu.github.io/personal-site \
pnpm build
BASE_PATH=/personal-site node scripts/gen-root-redirect.mjs
pnpm verify:export
```

`schedule` 使用 `cron: "17 3 * * 1"`（每周一 03:17 UTC）触发同一工作流：先刷新 `lib/repo-stats.json` 再重新导出部署；刷新后的 JSON 随本次产物发布，无需提交回仓库。

首次使用需在仓库 Settings → Pages 将 Source 设为 GitHub Actions。

### EdgeOne Pages 等静态托管

同一套产物可部署到任意静态托管：用相同的 `NEXT_OUTPUT=export` 构建，根路径部署时把 `NEXT_PUBLIC_BASE_PATH` 与 `BASE_PATH` 留空，并把 `NEXT_PUBLIC_SITE_URL` 换为新域名，最后依次运行 `node scripts/gen-root-redirect.mjs` 与 `pnpm verify:export`。自定义域名变化时无需改动页面代码。

> `pnpm start` 只适用于非 export 的 Node 构建；静态导出的产物在 `out/`，需由静态服务器托管或直接检查文件。

## 优化基线

本轮优化后的实测基线（2026-11-01，`NEXT_OUTPUT=export` 本地静态导出）：

- **字体媒体**：`out/_next/static/media` 289,404 B（282.6KB，13 个 woff2）；优化前约 4.9MB（117 个 `@font-face`，其中 101 个 Noto Sans SC 分片）。首页首访只请求 2 个字体切片，共 70.2KB（<150KB）。
- **页面**：19 个 HTML（2 首页 + 2 关于 + 2 项目索引 + 12 项目详情 + 1 全局 404）。
- **sitemap**：18 条 URL（2 首页 + 2 关于 + 2 项目索引 + 12 项目页）。
- **第三方请求**：浏览器端对 `api.github.com` 的请求为 0，仓库统计全部来自构建期快照。
- **OG**：19 张 1200×630 PNG，单张 <300KB。

## 质量与验收

最近一次全量验收（2026-11-01）：

- `pnpm check`、静态导出构建、`pnpm verify:export` 全部通过；导出为 19 个 HTML 页面、18 条 sitemap URL、19 张 OG PNG。
- **axe-core**：33 次扫描（首页/项目索引/关于/404 + 12 个项目详情页，375/1440，亮/暗主题）critical=0、serious=0，无横向溢出。
- **Lighthouse（移动端）**：首页 Performance 98 / Accessibility 100 / Best Practices 96 / SEO 100；项目索引 77 / 100 / 96 / 100。
- **响应式**：320/375/414/1440 截图无横向溢出；zh/en、亮/暗、404 与根入口均无回归。
- **字体与第三方**：字体媒体 282.6KB（<300KB）；导出产物中 `api.github.com` 出现 0 次。
