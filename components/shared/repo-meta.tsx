import { GitCommitHorizontal, History } from "lucide-react";
import { formatDate, type Locale } from "@/lib/i18n/config";
import { getRepoStatsSnapshot } from "@/lib/repo-stats";
import type { Dictionary } from "@/lib/i18n/dictionaries";

interface RepoMetaProps {
  /** GitHub 仓库地址（项目 frontmatter 的 github 字段） */
  githubUrl: string;
  /** 当前语言（决定日期本地化格式） */
  locale: Locale;
  /** 本地化文案 */
  copy: Dictionary["repoMeta"];
}

/**
 * 项目仓库元信息：最近更新日期与提交总数。
 * 服务端组件，只读取构建期快照（lib/repo-stats.json，由 `pnpm repo-stats` 刷新），
 * 静态 HTML 直接包含完整数据、无占位闪烁；浏览器端不再请求 GitHub API。
 * 内容检查保证每个 github 项目都有快照，缺失时整体隐藏。
 */
export function RepoMeta({ githubUrl, locale, copy }: RepoMetaProps) {
  const info = getRepoStatsSnapshot(githubUrl);
  if (!info) return null;

  return (
    <p className="inline-flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-muted-foreground">
      <History className="size-3.5" />
      <span>
        {copy.updatedLabel} {formatDate(locale, info.pushedAt.slice(0, 10))}
      </span>
      <span aria-hidden="true">·</span>
      <GitCommitHorizontal className="size-3.5" />
      <span>
        {info.commitCount} {copy.commitsSuffix}
      </span>
    </p>
  );
}
