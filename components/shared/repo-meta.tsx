"use client";

import { useEffect, useState } from "react";
import { GitCommitHorizontal, History } from "lucide-react";
import { formatDate, type Locale } from "@/lib/i18n/config";
import { getRepoStatsSnapshot } from "@/lib/repo-stats";
import type { Dictionary } from "@/lib/i18n/dictionaries";

/** 仓库实时元信息（来自 GitHub REST API） */
interface RepoInfo {
  /** 默认分支最近一次 push 时间（ISO 8601） */
  pushedAt: string;
  /** 默认分支提交总数 */
  commitCount: number;
}

/** sessionStorage 缓存键前缀 */
const CACHE_PREFIX = "repo-meta:";
/** 缓存有效期 1 小时：匿名 API 限额 60 次/小时/IP，缓存是防限流的主要手段 */
const CACHE_TTL_MS = 60 * 60 * 1000;
/** 单次请求超时，避免访客网络不佳时占位区长时间空悬 */
const FETCH_TIMEOUT_MS = 8000;

/** 进行中请求的去重表：同仓库多个卡片/页面挂载只发一轮请求 */
const inflight = new Map<string, Promise<RepoInfo>>();

/**
 * 从 GitHub API 拉取仓库最近更新时间与提交总数。
 * 提交总数通过 commits 分页响应的 Link 头（rel="last" 的页码即总数）获得，
 * 无需拉取全量提交；任一环节失败即抛出，由调用方决定降级展示。
 *
 * @param repo 形如 {owner}/{repo} 的仓库标识
 * @returns 仓库元信息
 */
async function fetchRepoInfo(repo: string): Promise<RepoInfo> {
  const init: RequestInit = {
    headers: { Accept: "application/vnd.github+json" },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  };

  const repoRes = await fetch(`https://api.github.com/repos/${repo}`, init);
  if (!repoRes.ok) throw new Error(`repo request failed: ${repoRes.status}`);
  const { pushed_at: pushedAt } = (await repoRes.json()) as {
    pushed_at: string;
  };

  const commitsRes = await fetch(
    `https://api.github.com/repos/${repo}/commits?per_page=1`,
    init
  );
  if (!commitsRes.ok) {
    throw new Error(`commits request failed: ${commitsRes.status}`);
  }
  // 仓库提交数 <= per_page 时没有 Link 头，直接取响应数组长度
  const lastPage = commitsRes.headers
    .get("Link")
    ?.split(",")
    .find((part) => part.includes('rel="last"'))
    ?.match(/[?&]page=(\d+)/)?.[1];
  const commitCount = lastPage
    ? Number(lastPage)
    : ((await commitsRes.json()) as unknown[]).length;

  return { pushedAt, commitCount };
}

/**
 * 读取 sessionStorage 缓存；过期、缺失或存储不可用时返回 null。
 */
function readCache(repo: string): RepoInfo | null {
  try {
    const raw = sessionStorage.getItem(CACHE_PREFIX + repo);
    if (!raw) return null;
    const cached = JSON.parse(raw) as RepoInfo & { fetchedAt: number };
    if (Date.now() - cached.fetchedAt > CACHE_TTL_MS) return null;
    return { pushedAt: cached.pushedAt, commitCount: cached.commitCount };
  } catch {
    return null;
  }
}

/**
 * 写入 sessionStorage 缓存；存储不可用（隐私模式等）时静默跳过。
 */
function writeCache(repo: string, info: RepoInfo): void {
  try {
    sessionStorage.setItem(
      CACHE_PREFIX + repo,
      JSON.stringify({ ...info, fetchedAt: Date.now() })
    );
  } catch {
    // 降级为不缓存，下次挂载重新拉取
  }
}

/**
 * 获取仓库元信息：命中进行中请求则复用，否则发起新请求并登记去重。
 */
function getOrFetchRepoInfo(repo: string): Promise<RepoInfo> {
  let request = inflight.get(repo);
  if (!request) {
    request = fetchRepoInfo(repo)
      .then((result) => {
        writeCache(repo, result);
        return result;
      })
      .finally(() => inflight.delete(repo));
    inflight.set(repo, request);
  }
  return request;
}

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
 * 服务端渲染时取发版前生成的静态快照（lib/repo-stats.json，`pnpm repo-stats` 刷新）
 * 作为默认值，静态 HTML 即含完整数据、无占位闪烁；挂载后浏览器端仍从 GitHub API
 * 静默刷新（匿名限额内靠 sessionStorage 缓存 + 请求去重兜底）。
 * 无快照且拉取失败时整体隐藏，不影响页面其余内容。
 */
export function RepoMeta({ githubUrl, locale, copy }: RepoMetaProps) {
  const [info, setInfo] = useState<RepoInfo | null>(
    () => getRepoStatsSnapshot(githubUrl) ?? null
  );
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    // 解析、缓存读取与网络请求全部放入微任务链，
    // 保证 setState 只发生在回调里（react-hooks/set-state-in-effect）
    const load = async () => {
      try {
        const repo = new URL(githubUrl).pathname.replace(/^\/|\/$/g, "");
        return readCache(repo) ?? getOrFetchRepoInfo(repo);
      } catch {
        return null; // 地址非法或请求失败，走降级
      }
    };

    load().then((result) => {
      if (cancelled) return;
      if (result) setInfo(result);
      // 已有快照时拉取失败不隐藏，继续展示默认值
      else if (!getRepoStatsSnapshot(githubUrl)) setFailed(true);
    });

    return () => {
      cancelled = true;
    };
  }, [githubUrl]);

  if (failed) return null;
  if (!info) return <div className="h-4" aria-hidden="true" />;

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
