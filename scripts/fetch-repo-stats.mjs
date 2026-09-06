/**
 * 发版前手动运行：`pnpm repo-stats`
 *
 * 扫描 content/projects/ 下各项目 frontmatter 的 github 字段，从 GitHub API
 * 拉取最近 push 时间与提交总数，写入 lib/repo-stats.json，作为 RepoMeta 的
 * 服务端默认值——页面静态 HTML 即含完整数据，访客端不再出现请求前的占位；
 * 发版后浏览器端仍会照常静默刷新到最新值。
 *
 * 某仓库拉取失败时保留 JSON 中的旧值（避免一次网络抖动清空默认数据）；
 * 若旧值也不存在则以非零码退出，提示发版者重跑。
 */
import { readdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const contentDir = join(root, "content", "projects");
const outputPath = join(root, "lib", "repo-stats.json");

/** 从 frontmatter 提取 github 仓库地址（形如 https://github.com/{owner}/{repo}） */
function extractGithubUrls(file) {
  const source = readFileSync(file, "utf8");
  const match = /^github:\s*(\S+)\s*$/m.exec(source);
  return match ? match[1] : null;
}

/** 拉取单个仓库的最近 push 时间与提交总数（逻辑对齐 repo-meta.tsx） */
async function fetchRepoInfo(repo) {
  const init = {
    headers: {
      Accept: "application/vnd.github+json",
      "User-Agent": "personal-site-repo-stats",
    },
  };

  const repoRes = await fetch(`https://api.github.com/repos/${repo}`, init);
  if (!repoRes.ok) throw new Error(`repo request failed: ${repoRes.status}`);
  const { pushed_at: pushedAt } = await repoRes.json();

  const commitsRes = await fetch(
    `https://api.github.com/repos/${repo}/commits?per_page=1`,
    init
  );
  if (!commitsRes.ok) {
    throw new Error(`commits request failed: ${commitsRes.status}`);
  }
  // 提交数 <= per_page 时没有 Link 头，直接取响应数组长度
  const lastPage = commitsRes.headers
    .get("Link")
    ?.split(",")
    .find((part) => part.includes('rel="last"'))
    ?.match(/[?&]page=(\d+)/)?.[1];
  const commitCount = lastPage
    ? Number(lastPage)
    : (await commitsRes.json()).length;

  return { pushedAt, commitCount };
}

// 收集全部去重后的仓库标识
const repos = new Set();
for (const locale of readdirSync(contentDir)) {
  for (const file of readdirSync(join(contentDir, locale))) {
    const url = extractGithubUrls(join(contentDir, locale, file));
    if (!url) continue;
    repos.add(new URL(url).pathname.replace(/^\/|\/$/g, ""));
  }
}

// 旧快照兜底：单个仓库失败时沿用旧值，不让默认数据开天窗
const previous = existsSync(outputPath)
  ? JSON.parse(readFileSync(outputPath, "utf8"))
  : {};
const next = {};
let hardFailure = false;

for (const repo of repos) {
  try {
    next[repo] = await fetchRepoInfo(repo);
    console.log(`✓ ${repo} — ${next[repo].commitCount} commits, pushed ${next[repo].pushedAt.slice(0, 10)}`);
  } catch (error) {
    if (previous[repo]) {
      next[repo] = previous[repo];
      console.warn(`⚠ ${repo} — 拉取失败（${error.message}），保留旧值 ${previous[repo].commitCount} commits`);
    } else {
      hardFailure = true;
      console.error(`✗ ${repo} — 拉取失败且无旧值：${error.message}`);
    }
  }
}

writeFileSync(outputPath, JSON.stringify(next, null, 2) + "\n");
console.log(`\n已写入 ${outputPath}`);
if (hardFailure) process.exit(1);
