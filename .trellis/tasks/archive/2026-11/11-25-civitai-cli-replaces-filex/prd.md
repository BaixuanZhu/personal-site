# 站点项目更新：civitai-cli 替换 FileX

## Goal

从个人站点移除 FileX 项目，新增 civitai-cli（`civ`，零依赖单文件 Go CLI，在终端检索/审查 Civitai 模型，是 danbooru-tag-mcp 的互补工具），并顶替 FileX 的首页精选位。站点项目总数保持 6 个/语言，精选保持恰好 4 个。

## 背景

- FileX 仓库（https://github.com/BaixuanZhu/FileX）准备废弃移除，站点不再展示。
- civitai-cli（https://github.com/BaixuanZhu/civitai-cli）已于 2026-11-22 创建、v0.5.0 发布于 2026-11-24，数据已核实：48 commits、6 releases、Go、MIT、Windows-only 单文件 `civ.exe`。
- 首页文案（zh/en 词典）中 FileX 出现 4 处：站点描述、首页简介、关于页两段叙述，均需替换。

## Requirements

### 内容文件
- 删除 `content/projects/zh/filex.mdx`、`content/projects/en/filex.mdx`。
- 新增 `content/projects/zh/civitai-cli.mdx`、`content/projects/en/civitai-cli.mdx`：
  - 与 danbooru-tag-mcp 同风格（概述 → 设计 → 用法 → 成果 → 反思），中英双语，同 slug、同 date、同 featured。
  - frontmatter 通过 `lib/projects.ts` 的 zod strictObject 校验；`date` 取 `"2026-11-24"`（v0.5.0 发布日），`featured: true`，`github: https://github.com/BaixuanZhu/civitai-cli`。
  - metrics 使用已核实数据：6 个 Release、48 commits。
  - 内容要点：零依赖单文件 Go CLI（Windows amd64/arm64）；search/show/tags/compare 检索；recipe 提取 trigger words 与示例 prompt；旗舰 vet（哈希反查本地模型文件）、sync（目录批量审计）、resolve（声明式就绪检查）；`--json` 结构化输出；代理与 `civ upgrade` 自更新；MIT。
  - 明确写出与 danbooru-tag-mcp 的互补定位（一个查标签写 prompt，一个找模型验文件）。
- 封面图：新增 `public/images/projects/civitai-cli.svg` 与 `civitai-cli-zh.svg`（1200×750 终端卡片风格，仿现有 filex.svg 模板）；删除 `filex.svg` 与 `filex-zh.svg`。

### 首页与关于文案
- `lib/i18n/dictionaries/zh.ts` 与 `en.ts` 中共 4 处 FileX 提及（站点 description、首页 about 简介、关于页两段）替换为 civitai-cli 的描述；措辞与现有风格一致，不提 FileX。

### 数据快照与 OG 图
- 运行 `pnpm repo-stats`（匿名 GitHub API 已被限流，用 `GITHUB_TOKEN=$(gh auth token)` 提供认证）刷新 `lib/repo-stats.json`：移除 FileX 条目、新增 civitai-cli 条目。
- 运行 `pnpm og` 重新生成 OG 图：删除 `public/og/project-filex-{zh,en}.png`，新增 `public/og/project-civitai-cli-{zh,en}.png`，总产物仍 19 张。

### 文档
- `README.md`：更新精选策略描述（FileX → civitai-cli）、MDX 目录注释（filex → civitai-cli）。
- `lib/seo.ts` 注释中的 `/projects/filex/` 仅为示例，可顺手改为 civitai-cli 示例，不改逻辑。

## 约束

- 精选恰好 4 个/语言（devtools、danbooru-tag-mcp、jvm、civitai-cli），`scripts/check-content.mjs` 强制校验。
- 中英 MDX 同 slug、同 date、同 featured（check-content.mjs 强制）。
- 所有 GitHub 链接必须与 repo-stats.json 快照一一对应（check-content.mjs 强制）。
- OG 产物必须提交（CI 只校验不生成）；`pnpm og` 需要本机浏览器（Windows 上 Edge/Chrome 可用）。
- 遵守 AGENTS.md 注释规则：新增公共导出需文档注释（本次主要是内容与数据，涉及代码处极少）。
- 遵循 memory「改样式必须本地截图核验」：OG 图与封面 SVG 生成后需本地截图核验渲染效果。
- 遵循 memory「发版前跑 pnpm repo-stats」：提交前确认快照为最新。

## Acceptance Criteria

- [x] 全站（content/、lib/、public/、README.md）grep 不到 FileX/filex 残留（`.trellis/` 归档与 git 历史除外）。
- [x] `pnpm check`（lint + check:content + check:og）通过。
- [x] `pnpm build` 成功，sitemap 仍为 18 URL（6 项目 × 2 语言；本地未设 NEXT_OUTPUT=export 不产出 out/，以构建路由清单核对 12 个项目页）。
- [x] 首页精选为 devtools / danbooru-tag-mcp / jvm / civitai-cli 四个（check-content.mjs 强制每语言恰好 4 个 featured）。
- [x] `/zh/projects/civitai-cli/` 与 `/en/projects/civitai-cli/` 进入构建路由；filex 路由已消失（静态导出后旧 URL 即 404）。
- [x] repo-stats.json 含 civitai-cli 条目（48 commits，pushedAt 2026-11-24），无 FileX 条目。
- [x] OG 图与封面 SVG 经本地截图核验，视觉与现有项目风格一致（中文版封面光标越界已修复）。

## 实施记录

- 计划外发现并处理：`scripts/generate-og.mjs` 的项目索引 OG 模板硬编码了 FileX 标签与「文件操作」描述，已替换为 civitai-cli 并重生成 OG。
- 计划外发现并处理：刷新 repo-stats 后 danbooru-tag-mcp 实际 commits（45）与 MDX 硬编码（22）漂移，已同步中英 frontmatter 与正文表格共 4 处；README 第 7 条补充了该注意事项。
- 封面 SVG 复用 filex 模板，主色改为玫瑰红（#fb7185→#e11d48），与其他项目配色不冲突。

## Notes

- 轻量任务：PRD-only，不需要 design.md / implement.md。
- 提交信息风格参考近期 commit：`feat: swap FileX for civitai-cli in project showcase`。
- FileX 仓库本身的删除/归档由用户在 GitHub 上自行处理，不在本任务范围。
