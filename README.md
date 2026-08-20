# Personal Portfolio · 个人作品集

面试用个人作品集网站，简洁、大气、高级。**中英双语**（`/zh` 与 `/en` 独立路由，SSG 静态生成），支持亮/暗主题与移动端响应式。

## 技术栈（2026-08 最新）

| 技术 | 版本 | 说明 |
| --- | --- | --- |
| Next.js | 16.3（App Router + Turbopack） | 要求 Node.js ≥ 20.9 |
| React | 19.x | — |
| Tailwind CSS | v4.3 | CSS-first 配置（`app/globals.css` 中 `@theme`），无 tailwind.config |
| shadcn/ui | CLI v4 | Radix 基座 + Nova 预设，组件在 `components/ui/` |
| motion | 13.x | 即更名后的 Framer Motion（`import { motion } from "motion/react"`） |
| next-mdx-remote-client | v2 | 原 next-mdx-remote 的维护 fork，渲染 `content/` 下的 MDX |
| next-themes | 0.4 | class 策略亮/暗主题 |

## 快速开始

```bash
pnpm install
pnpm dev      # 开发：http://localhost:3000（自动跳转 /zh 或 /en）
pnpm build    # 生产构建（两种语言全部页面 SSG）
pnpm start    # 启动生产服务器
pnpm lint     # ESLint
```

## 目录结构

```
app/
  [lang]/                  # 多语言路由（zh / en 两种参数全部 SSG）
    layout.tsx             # 根布局：<html lang> 随语言变化，注入字典
    page.tsx               # 首页（英雄区/精选项目/技能/关于摘要/联系）
    about/page.tsx         # 关于我完整页
    projects/[slug]/       # 项目详情页（MDX 渲染）
    not-found.tsx          # 语言内 notFound() 边界
  global-not-found.tsx     # 全局 404（未匹配路由，中英双语）
proxy.ts                   # Next 16 请求代理：语言协商重定向（取代 middleware.ts）
components/
  sections/                # 首页各区块（文案由字典 props 注入）
  shared/                  # Header/Footer/语言切换/主题切换/项目卡片等
  ui/                      # shadcn/ui 组件
lib/
  config.ts                # 与语言无关的配置：姓名/邮箱/社交链接/导航
  i18n/
    config.ts              # 语言清单、Locale 类型、日期本地化
    dictionaries.ts        # getDictionary(locale)
    dictionaries/zh.ts     # 中文字典（结构基准 Dictionary 类型）
    dictionaries/en.ts     # 英文字典（结构必须与 zh 完全一致）
  projects.ts              # 按语言读取 content/projects/{lang}/*.mdx
content/
  projects/
    zh/                    # 4 个中文项目 MDX（jvm/agent-skills/devtools/claude-code-hooks）
    en/                    # 4 个英文项目 MDX（与 zh 同 slug）
public/                    # 头像、项目预览图、resume.pdf
```

## 多语言机制

- **路由**：所有页面在 `app/[lang]/` 下，构建期为 `zh`/`en` 全量 SSG（`generateStaticParams` + `dynamicParams = false`）。
- **入口协商**：根 `proxy.ts` 把无语言前缀的请求 307 到偏好语言。优先级：`NEXT_LANG` Cookie（用户显式切换过）> 默认 `zh`；不侦测 `Accept-Language`，未表达偏好的访客一律进入中文站。
- **切换器**：Header 中的「中 / EN」按钮组，切换时保留当前路径（如 `/zh/about → /en/about`）并写 Cookie 记忆偏好。
- **文案**：UI 文案全部在 `lib/i18n/dictionaries/`，`zh.ts` 是结构基准（`Dictionary` 类型），`en.ts` 必须保持相同键结构。
- **内容**：项目正文按语言放在 `content/projects/{zh|en}/<slug>.mdx`，同 slug 双语互为 hreflang 备选。

## 内容维护指南

站点已填充真实个人信息与 4 个开源项目。日常更新入口：

1. **个人信息**：`lib/config.ts`（姓名/邮箱/GitHub/简历路径）+ `lib/i18n/dictionaries/{zh,en}.ts`（自我介绍、技能矩阵、关于页文案）。注意：`lib/config.ts` 的 `url` 仍是占位域名，部署后改为真实域名（用于 OG 绝对链接）。
2. **项目内容**：编辑 `content/projects/{zh,en}/<slug>.mdx`（frontmatter 含 title/description/tags/image/date/github/demo/featured/metrics 量化成果），两语言保持相同 slug。
3. **静态资源**：`public/avatar.svg`、`public/images/projects/*.svg`（当前为程序生成的占位图，可换成真实截图）、`public/resume.pdf`（仍为占位文件，待放入真实简历）。
4. **frontmatter 注意**：description 含英文冒号时必须用引号包裹（YAML 语法要求）。

## 主题定制

设计令牌集中在 `app/globals.css` 的 `@theme inline` 区块（主色、圆角、字体变量）；MDX 排版由 `@tailwindcss/typography` 提供，暗色覆盖也在同文件。

新增组件：`pnpm exec shadcn add <component>`。

## 部署到 Vercel

推送仓库后在 [vercel.com/new](https://vercel.com/new) 导入即可（零配置）。部署后记得把 `lib/config.ts` 中的 `url` 改为真实域名（用于 OG 绝对链接）。
