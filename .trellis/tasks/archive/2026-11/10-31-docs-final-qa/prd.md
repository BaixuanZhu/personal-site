# 文档更新与全量集成验收

## Goal

更新 README，执行 lint/content/build/verify/axe/Lighthouse/截图验收，记录前后指标并做跨子任务集成审查。

## Requirements

- README 更新：
  - 快速开始脚本补齐 `pnpm check`、`check:content`、`check:og`、`verify:export`、`og`、`repo-stats`。
  - 目录结构补充 `/projects` 索引页、`public/og/`、`scripts/generate-og.mjs`、`check-og.mjs`、`check-content.mjs`、`verify-export.mjs`；删除已移除的 `[lang]/not-found.tsx`。
  - 内容维护说明：featured 恰好 4 个、未精选项目仍从索引页可达；OG 图重生成流程（本机 Chrome/Edge、`pnpm og`、产物需提交、`pnpm check:og` 校验）。
  - 部署说明：构建前置检查、根跳转页顺序、每周一定时刷新 repo-stats 并重新部署。
  - 架构约定：字体决策（移除 Noto Sans SC、系统中文栈）、全局 404、SEO canonical/hreflang/x-default/OG 约定。
  - 记录优化前后关键指标。
- 全量验收：
  - `pnpm check`、静态导出构建、`pnpm verify:export` 全部通过。
  - axe 扫描首页、项目索引、关于页、项目详情页、404（亮/暗、375/1440），无 critical/serious。
  - Lighthouse（移动端）首页与项目索引：SEO / Best Practices / Accessibility 达标，记录 Performance。
  - 320/375/414/1440 截图无横向溢出；zh/en、亮/暗、404 与根入口无回归。
  - 导出产物中 `api.github.com` 请求为 0；字体媒体体积 <300KB。
- 跨任务集成审查：提交历史、脚本链、CI 顺序、页面覆盖清单一致，无重复/失效配置。
- 验收证据写入 README「质量与验收」与任务备注；不新增临时分析文档。

## Acceptance Criteria

- [x] README 与当前实现一致（脚本、目录、流程、指标）。
- [x] lint/content/OG 检查/静态导出/导出验收全部通过。
- [x] axe critical=0、serious=0；Lighthouse SEO ≥95、Best Practices ≥95、Accessibility ≥95。
- [x] 320/375/414/1440 无横向溢出，关键页面截图通过。
- [x] 字体媒体 <300KB、`api.github.com` 0 次、19 个 HTML 页面与 18 条 sitemap URL。
- [x] 父任务 8 个子任务全部完成并归档。
- [x] 不推送、不部署，等待用户明确同意。

## Notes

- 轻量任务：PRD-only。
- 基线指标来自父任务 `prd.md`：字体资源约 4.9MB、首访约 1.03MB、sitemap 16 URL、6 个项目全部 featured。

### 验收记录（2026-11-01）

- `pnpm check`：lint、6+6 内容一致性、19 张 OG 全部通过。
- 静态导出 + `pnpm verify:export`：19 个 HTML、18 条 sitemap URL、19 张 OG、根跳转页与 404 通过。
- axe-core 4.10.3：33 次扫描（首页/索引/关于/404 + 12 个项目页，375/1440，亮/暗）critical=0、serious=0，无横向溢出。
- Lighthouse 13.6.0 移动端：首页 98/100/96/100，项目索引 77/100/96/100（Performance/Accessibility/Best Practices/SEO）。
- 字体：`out/_next/static/media` 289,404 B（282.6KB，13 个 woff2）；首页首访字体传输 70.2KB。
- 导出产物 `api.github.com` 出现 0 次；favicon 移入 `public/` 后不再计入字体媒体目录。
- 负向测试：缺失 title、跨语言 featured 不一致、封面缺失、repo-stats 缺失、OG 缺图/1×1/超 300KB 均按预期失败；`pnpm og` 重复生成哈希一致。
- 未推送、未部署；发布需用户明确同意。
