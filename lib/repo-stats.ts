import repoStats from "./repo-stats.json";

/** 单个仓库的统计快照（RepoMeta 的展示数据来源） */
export interface RepoStatsSnapshot {
  /** 默认分支最近一次 push 时间（ISO 8601 日期） */
  pushedAt: string;
  /** 默认分支提交总数 */
  commitCount: number;
}

/** repo-stats.json 的索引表：键为 {owner}/{repo} */
const stats = repoStats as Record<string, RepoStatsSnapshot>;

/**
 * 从构建期静态快照中读取仓库统计，是 RepoMeta 唯一的运行时数据源：
 * 页面 HTML 直接带完整数据，浏览器端不再请求 GitHub API 做二次刷新。
 * 快照由 `pnpm repo-stats` 生成，并在部署工作流构建前刷新。
 * @param githubUrl 项目 frontmatter 的 GitHub 仓库地址
 * @returns 对应仓库的快照；JSON 中无此仓库（新项目尚未刷新快照）时返回 undefined
 */
export function getRepoStatsSnapshot(
  githubUrl: string
): RepoStatsSnapshot | undefined {
  const repo = new URL(githubUrl).pathname.replace(/^\/|\/$/g, "");
  return stats[repo];
}
