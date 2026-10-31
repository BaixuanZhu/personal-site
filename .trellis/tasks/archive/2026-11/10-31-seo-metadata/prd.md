# SEO 元数据体系与结构化数据

## Goal

统一 canonical、hreflang（zh/en/x-default）、按语言区分的 `og:url`/`og:type`，让标题同时包含中文名与英文名，为首页/关于/项目页补充可解析的 JSON-LD，并完善 sitemap 与根跳转页元数据。

## Background

当前 `app/[lang]/layout.tsx` 在布局层写死 `alternates.languages` 与 `openGraph.url: siteConfig.url`，导致所有页面继承首页的 hreflang，About 页也指向站点根 URL；全站无 canonical；项目页 `og:image` 为 SVG；sitemap 无 x-default；根跳转页只有 title 与 JS 跳转。

## Requirements

- 新增 `lib/seo.ts`（或同等职责模块），集中提供：
  - 站点绝对 URL 与站内路径拼接（`siteConfig.url` 已含部署子路径）。
  - 某语言的页面 canonical：`/{locale}/`、`/{locale}/about/`、`/{locale}/projects/{slug}/`（保留尾斜杠）。
  - `hreflang` 备选：`zh`、`en`、`x-default`（x-default 指向中文版本）。
  - 页面级元数据构造：canonical + languages + `openGraph`（title/description/url/siteName/locale/type）+ `twitter`。
  - 站点标题同时包含「朱柏轩」与「Galaxy」（中英各一版），供 title 模板与首页默认标题使用。
- `app/[lang]/layout.tsx`：保留 `metadataBase`、description、title 模板；移除布局层的 `alternates` 与固定 `openGraph.url`，避免子页面继承错误值。
- 首页 `app/[lang]/page.tsx`：新增 `generateMetadata`，提供唯一 canonical、zh/en/x-default、按语言的 `og:url`、`og:type=website`、`og:locale`、twitter。
- 关于页与项目页：补齐 canonical/alternates/`og:url`；项目页 `og:type=article`，保留项目标题与描述；不再使用相对 hreflang。
- JSON-LD（使用 `<script type="application/ld+json">`，对 `<` 做转义）：
  - 首页：`Person`（姓名/别名/职位/主页/GitHub）+ `WebSite`（名称/URL/inLanguage）。
  - 关于页：`ProfilePage`，`mainEntity` 为同一 `Person`。
  - 项目页：`SoftwareSourceCode` 或 `CreativeWork`，含 name、description、codeRepository、datePublished、image（绝对 URL）、inLanguage、author。
- `app/sitemap.ts`：所有条目的 alternates 增加 `x-default`（指向中文 URL），保持现有 URL/lastModified 行为。
- `scripts/gen-root-redirect.mjs`：根跳转页补充 description、`og:title`、`og:description`、`og:url`、`og:type`、`og:site_name`、`theme-color`（亮/暗）、`robots=noindex`；绝对 URL 从 `SITE_URL`/`NEXT_PUBLIC_SITE_URL` 读取，回退到 `siteConfig` 默认域名；换行与引号需安全转义。
- `scripts/verify-export.mjs`：扩展检查（对 zh/en 首页、关于页与全部项目页）：
  - 恰好一个 `<link rel="canonical">`，且等于该页预期绝对 URL。
  - 存在 `hreflang="zh"`、`"en"`、`"x-default"`，其中 x-default 指向 zh。
  - `og:url` 等于 canonical；`og:type` 符合页面类型；`og:locale` 与语言一致。
  - 每个页面含可 `JSON.parse` 的 JSON-LD，且 `@type` 符合页面类型。
  - 根 `index.html` 含 description、og:title、og:url、theme-color、noindex。
- 不修改字典键结构（如需标题姓名，从现有 `brand.nativeName` 与 `siteConfig.name` 组合）。

## Dependencies

Wave 0（内容/导出护栏）与 Wave 1（字体/可访问性基础）已完成。Wave 4（OG 图）会在此之后补充 `og:image`；Wave 7 会为项目索引页复用本任务的 helper。

## Acceptance Criteria

- [x] 首页、关于页与 12 个项目页均只有一个 canonical，且与页面语言/路径一致。
- [x] 每个页面有 zh/en/x-default hreflang，x-default 指向中文版本；About 不再继承首页 hreflang。
- [x] 每个页面 `og:url` 等于 canonical，`og:locale` 与语言一致，`og:type` 为 website（首页/关于）或 article（项目）。
- [x] 首页、关于页、项目页各含合法 JSON-LD，`JSON.parse` 通过且 `@type` 符合预期。
- [x] 根 `out/index.html` 含 description/OG/theme-color/noindex，且跳转脚本仍正常。
- [x] `out/sitemap.xml` 每条 `<url>` 的 alternates 含 x-default。
- [x] `pnpm exec tsc --noEmit`、`pnpm lint` 通过；静态导出构建成功。
- [x] `pnpm verify:export` 的 SEO 检查全部通过（404 标题检查由 Wave 3 修复后整体通过）。

## Out of Scope

- 生成或接入 OG PNG（Wave 4）。
- 项目索引页与首页精选（Wave 7）。
- 404 页面视觉与标题（Wave 3）。
