# 内容完整性检查与 CI 质量门禁

## Goal

让非法内容在构建前失败，并让 CI 在部署前拦住 lint、frontmatter、跨语言一致性、资源缺失与导出产物问题。

## Requirements

- `lib/projects.ts` 使用 zod 校验 frontmatter；缺字段、字段类型错误、非法日期时抛出带文件路径的错误，不再静默跳过。
- 新增 `scripts/check-content.mjs`：中英项目 slug 集合一致、必填字段存在、日期与 featured 一致、封面图存在、每个 github 项目在 `lib/repo-stats.json` 中有快照。
- 新增 `scripts/verify-export.mjs`：检查 `out/` 的首页、关于页、全部项目页、404、sitemap、robots 是否存在且非空。阶段一先做基础检查，SEO/OG 子任务再扩展。
- `package.json` 增加 `check:content`、`verify:export`、`check`；`build` 在 `next build` 前执行内容检查。
- `.github/workflows/deploy.yml` 在构建前跑 `pnpm lint`，构建后跑 `pnpm verify:export`。

## Dependencies

无。Wave 0 必须先于其他子任务完成。

## Acceptance Criteria

- [ ] 故意破坏任一必填 frontmatter，`pnpm build`/`pnpm check:content` 失败并指出文件与字段。
- [ ] 中英 slug/日期/featured 不一致时检查失败。
- [ ] 封面图缺失或 github 项目缺 repo-stats 快照时检查失败。
- [ ] `pnpm lint`、`pnpm check:content` 通过。
- [ ] 静态导出后 `node scripts/verify-export.mjs` 通过。
- [ ] CI 构建步骤包含 lint 与导出验收。

## Out of Scope

- SEO 标签、OG 图、404 视觉、字体、RepoMeta 组件改造（由后续子任务负责）。
