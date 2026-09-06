import repoStats from "./repo-stats.json";

/** 单个仓库的统计快照（结构对齐 components/shared/repo-meta.tsx 的 RepoInfo） */
export interface RepoStatsSnapshot {
  /** 默认分支最近一次 push 时间（ISO 8601 日期） */
  pushedAt: string;
  /** 默认分支提交总数 */
  commitCount: number;
}

/** repo-stats.json 的索引表：键为 {owner}/{repo} */
const stats = repoStats as Record<string, RepoStatsSnapshot>;

/**
 * 从发版前生成的静态快照中读取仓库统计，作为 RepoMeta 的服务端默认值：
 * 页面 HTML 直接带完整数据，访客端无需等待 GitHub API 即有内容可渲染。
 * @param githubUrl 项目 frontmatter 的 GitHub 仓库地址
 * @returns 对应仓库的快照；JSON 中无此仓库（新项目尚未刷新快照）时返回 undefined
 */
export function getRepoStatsSnapshot(
  githubUrl: string
): RepoStatsSnapshot | undefined {
  const repo = new URL(githubUrl).pathname.replace(/^\/|\/$/g, "");
  return stats[repo];
}
