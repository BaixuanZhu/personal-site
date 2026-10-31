# 仓库统计服务端化与定时刷新

## Goal

让 RepoMeta 只使用构建期快照、彻底移除浏览器端 GitHub API 请求，并在部署工作流中加入每周定时刷新，保证静态 HTML 直接带最新仓库数据。

## Background

`components/shared/repo-meta.tsx` 目前是客户端组件：先用 `lib/repo-stats.json` 快照渲染，挂载后再请求 `api.github.com`（repo + commits 两个请求/仓库），带 sessionStorage 缓存与请求去重。这带来第三方请求、匿名限流与不必要的客户端 JS；快照只在手动运行 `pnpm repo-stats` 时更新。

## Requirements

- `components/shared/repo-meta.tsx` 改为服务端组件：
  - 删除 `"use client"`、`useEffect`/`useState`、全部 `fetch`/sessionStorage/inflight 缓存与超时逻辑。
  - 直接调用 `getRepoStatsSnapshot(githubUrl)` 渲染；无快照时返回 `null`（内容检查已保证有 github 的项目必有快照）。
  - 保留现有 props（`githubUrl`、`locale`、`copy`）与视觉输出（更新日期 + 提交数）。
- 确认 `ProjectCard`/`FeaturedProjects` 仍为服务端渲染，静态 HTML 中包含快照日期与提交数，无占位闪烁。
- `lib/repo-stats.ts`：保持快照读取职责；注释更新为「唯一数据源」，不再描述客户端刷新。
- `scripts/fetch-repo-stats.mjs`：更新顶部注释，删除「发版后浏览器端仍会静默刷新」的描述；保留失败保留旧值/硬失败逻辑。
- `.github/workflows/deploy.yml`：
  - 增加每周定时触发（cron，UTC，建议周一低峰）。
  - 在构建前增加 `Refresh repo stats` 步骤：`pnpm repo-stats`，注入 `GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}` 提高限额。
  - 定时与 push/manual 部署都使用刷新后的快照构建；无需把 JSON 提交回仓库。
  - 保持现有 lint/content/build/verify 顺序，刷新步骤放在内容检查之前，确保新仓库若拉取失败会阻断部署。
- 不改变 repo-stats 数据形状与 RepoMeta 文案键。

## Dependencies

Wave 0 已完成（`check:content` 已校验每个 github 项目都有快照）。与 Wave 2 并行，文件范围不重叠。

## Acceptance Criteria

- [ ] `components/shared/repo-meta.tsx` 不再包含 `"use client"`、`api.github.com`、`sessionStorage`、`useEffect`。
- [ ] 构建产物的 JS 与静态 HTML 中 `api.github.com` 出现次数为 0。
- [ ] 首页与项目页静态 HTML 直接包含「更新时间/提交数」数据（来自 `lib/repo-stats.json`）。
- [ ] `deploy.yml` 含每周 `schedule` 与带 token 的 `Refresh repo stats` 步骤，且位于构建前。
- [ ] `pnpm exec tsc --noEmit`、`pnpm lint`、`pnpm check:content` 通过；静态导出构建成功。

## Out of Scope

- 修改 GitHub API 抓取字段或 repo-stats 数据格式。
- 把快照自动提交回仓库（定时构建直接使用刷新结果）。
