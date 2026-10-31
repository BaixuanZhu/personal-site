# 项目索引页与首页精选策展

## Goal

新增中英项目索引页，首页展示 4 个精选，补齐索引页 SEO/OG/sitemap 并确保所有项目可达。

## Requirements

- 新增 `/zh/projects/` 与 `/en/projects/` 索引页，复用 `ProjectCard` 展示全部项目（按日期倒序）。
- 首页精选固定为 4 个：FileX、DevTools、jvm、Danbooru Tag MCP；`agent-skills` 与 `claude-code-hooks` 取消 featured，但仍可通过索引页与详情页访问。
- 首页精选区块增加「查看全部项目」入口；关于页 CTA 与项目详情页返回链接指向索引页。
- 索引页提供 canonical/hreflang/OG/JSON-LD（CollectionPage + ItemList），分享图 `public/og/projects-{zh,en}.png`。
- sitemap 增加索引页；`check-content` 强制每种语言 featured 恰好 4 个且中英一致。
- `check-og`、`generate-og`、`verify-export` 的预期页面/图片清单同步更新。
- 索引页文案进入 zh/en 字典，保持结构一致。

## Acceptance Criteria

- [ ] `/zh/projects/`、`/en/projects/` 静态导出成功，列出全部 6 个项目且均可达详情页。
- [ ] 首页只渲染 4 个精选项目，顺序为 FileX、Danbooru Tag MCP、jvm、DevTools。
- [ ] `pnpm check`、`pnpm build`、`pnpm verify:export` 全部通过，17→19 个 HTML 页面、sitemap 18 个 URL。
- [ ] 索引页 canonical/hreflang/x-default、OG/Twitter 图与 JSON-LD 通过导出验收。
- [ ] 320/375/414px 下索引页无横向溢出，卡片触控目标正常。

## Notes

- 轻量任务：PRD-only，不单独编写 design.md / implement.md。
