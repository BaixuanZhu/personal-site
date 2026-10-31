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
| pnpm | 11.8 | `packageManager` 字段固定版本 |

## 快速开始

```bash
pnpm install
pnpm dev         # 开发：http://localhost:3000（自动跳转 /zh 或 /en）
pnpm build       # 生产构建（两种语言全部页面 SSG）
pnpm start       # 启动 Node 生产服务器（仅非 export 构建）
pnpm lint        # ESLint
pnpm repo-stats  # 刷新 lib/repo-stats.json 仓库统计快照
```

## 目录结构

```
app/
  [lang]/                  # 多语言路由（zh / en 两种参数全部 SSG）
    layout.tsx             # 根布局：<html lang> 随语言变化，注入字典与 SEO 元数据
    page.tsx               # 首页（英雄区/精选项目/技能/关于摘要/联系）
    about/page.tsx         # 关于我完整页
    projects/[slug]/       # 项目详情页（MDX 渲染）
    not-found.tsx          # 语言内 notFound() 边界
  global-not-found.tsx     # 全局 404（未匹配路由，中英双语）
  sitemap.ts               # sitemap.xml（16 个 URL，含 hreflang 备选）
  robots.ts                # robots.txt（指向 sitemap）
proxy.ts                   # Next 16 请求代理：语言协商重定向（取代 middleware.ts）
components/
  sections/                # 首页各区块（文案由字典 props 注入）
  shared/                  # Header/Footer/语言切换/主题切换/项目卡片/RepoMeta 等
  ui/                      # shadcn/ui 组件
lib/
  config.ts                # 与语言无关的配置：姓名/邮箱/社交链接/导航/部署子路径
  i18n/
    config.ts              # 语言清单、Locale 类型、日期本地化
    dictionaries.ts        # getDictionary(locale)
    dictionaries/zh.ts     # 中文字典（结构基准 Dictionary 类型）
    dictionaries/en.ts     # 英文字典（结构必须与 zh 完全一致）
  projects.ts              # 按语言读取 content/projects/{lang}/*.mdx
  repo-stats.json          # pnpm repo-stats 生成的构建期统计快照
content/
  projects/
    zh/                    # 6 个中文项目 MDX（filex/danbooru-tag-mcp/jvm/agent-skills/devtools/claude-code-hooks）
    en/                    # 6 个英文项目 MDX（与 zh 同 slug）
public/
  images/projects/         # 项目预览图（1200×750 SVG，中英各一版 + placeholder）
scripts/
  fetch-repo-stats.mjs     # 扫描 MDX 的 github 地址，刷新仓库统计快照
  gen-root-redirect.mjs    # 静态导出时生成根跳转页（替代 proxy 语言协商）
```

## 多语言机制

- **路由**：所有页面在 `app/[lang]/` 下，构建期为 `zh`/`en` 全量 SSG（`generateStaticParams` + `dynamicParams = false`）。
- **入口协商**：根 `proxy.ts` 把无语言前缀的请求 307 到偏好语言。优先级：`NEXT_LANG` Cookie（用户显式切换过）> 默认 `zh`；不侦测 `Accept-Language`，未表达偏好的访客一律进入中文站。纯静态托管没有代理，由 `scripts/gen-root-redirect.mjs` 生成功能一致的跳转页。
- **切换器**：Header 中的「中 / EN」按钮组，切换时保留当前路径（如 `/zh/about → /en/about`）并写 Cookie 记忆偏好。
- **文案**：UI 文案全部在 `lib/i18n/dictionaries/`，`zh.ts` 是结构基准（`Dictionary` 类型），`en.ts` 必须保持相同键结构。
- **内容**：项目正文按语言放在 `content/projects/{zh|en}/<slug>.mdx`，同 slug 双语互为 hreflang 备选。

## 内容维护指南

站点已填充真实个人信息与 6 个开源项目。日常更新入口：

1. **个人信息**：`lib/config.ts`（姓名/邮箱/GitHub）+ `lib/i18n/dictionaries/{zh,en}.ts`（自我介绍、技能矩阵、关于页文案）。
2. **项目内容**：编辑 `content/projects/{zh,en}/<slug>.mdx`（frontmatter 含 title/description/tags/image/date/github/demo/featured/metrics），两语言保持相同 slug 与日期。`date` 决定排序，`featured: true` 才会上首页。
3. **项目配图**：`public/images/projects/*.svg`（1200×750 终端卡片风格，中英各一版；`placeholder.svg` 是缺少 image 时的兜底）。frontmatter 中写 `/images/...`，渲染时由 `withBasePath` 拼接部署前缀，不要在 MDX 里手写 `/personal-site`。
4. **frontmatter 注意**：description 含英文冒号时必须用引号包裹（YAML 语法要求）；metrics 的 `value` 必须是字符串，否则会被 `lib/projects.ts` 过滤。
5. **仓库统计**：内容定稿后运行 `pnpm repo-stats`（可选 `GITHUB_TOKEN=$(gh auth token) pnpm repo-stats` 降低匿名 API 限流风险），刷新 `lib/repo-stats.json`。单个仓库拉取失败时保留旧值。

## 主题定制

设计令牌集中在 `app/globals.css` 的 `@theme inline` 区块（主色、圆角、字体变量）；MDX 排版由 `@tailwindcss/typography` 提供，暗色覆盖也在同文件。

新增组件：`pnpm exec shadcn add <component>`。

## 构建与部署

### 环境变量

| 变量 | 作用 | 示例 |
| --- | --- | --- |
| `NEXT_OUTPUT` | 设为 `export` 时启用 `output: "export"` 静态导出 | `export` |
| `NEXT_PUBLIC_BASE_PATH` | 子路径部署前缀，同时写入 `basePath` / `assetPrefix` | `/personal-site` |
| `NEXT_PUBLIC_SITE_URL` | 站点绝对地址，用于 OG、sitemap、robots | `https://baixuanzhu.github.io/personal-site` |
| `BASE_PATH` | 仅 `gen-root-redirect.mjs` 使用，与 `NEXT_PUBLIC_BASE_PATH` 保持一致 | `/personal-site` |
| `GITHUB_TOKEN` | 可选，`pnpm repo-stats` 请求 GitHub API 时携带 | `gh auth token` 的输出 |

### GitHub Pages（默认）

`.github/workflows/deploy.yml` 在推送 `main` 或手动触发时执行静态导出并发布：

```bash
NEXT_OUTPUT=export \
NEXT_PUBLIC_BASE_PATH=/personal-site \
NEXT_PUBLIC_SITE_URL=https://baixuanzhu.github.io/personal-site \
pnpm build
BASE_PATH=/personal-site node scripts/gen-root-redirect.mjs
```

首次使用需在仓库 Settings → Pages 将 Source 设为 GitHub Actions。

### EdgeOne Pages 等静态托管

同一套产物可部署到任意静态托管：用相同的 `NEXT_OUTPUT=export` 构建，根路径部署时把 `NEXT_PUBLIC_BASE_PATH` 与 `BASE_PATH` 留空，并把 `NEXT_PUBLIC_SITE_URL` 换为新域名，最后运行 `node scripts/gen-root-redirect.mjs` 生成根跳转页。自定义域名变化时无需改动页面代码。

> `pnpm start` 只适用于非 export 的 Node 构建；静态导出的产物在 `out/`，需由静态服务器托管或直接检查文件。
