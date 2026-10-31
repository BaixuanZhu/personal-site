/**
 * 内容完整性检查：`pnpm check:content`（`pnpm build` 前自动执行）。
 *
 * 校验中英项目 slug 集合、必填 frontmatter、日期与 featured 一致性、
 * 封面图是否存在、GitHub 仓库是否已有 repo-stats 快照。
 * 任一问题都会以非零码退出，并指出文件与字段。
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, isAbsolute, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const contentRoot = join(root, "content", "projects");
const publicRoot = join(root, "public");
const repoStatsPath = join(root, "lib", "repo-stats.json");
const locales = ["zh", "en"];
const datePattern = /^\d{4}-\d{2}-\d{2}$/;

/** @type {string[]} */
const errors = [];

/** 转成仓库根目录下的正斜杠相对路径，便于在 CI 日志中定位 */
function displayPath(filePath) {
  return relative(root, filePath).split("\\").join("/");
}

function report(filePath, message) {
  errors.push(`${displayPath(filePath)}: ${message}`);
}

/** 日期必须是 YYYY-MM-DD 且真实存在（排除 2026-02-30） */
function isValidCalendarDate(value) {
  if (!datePattern.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

/** 读取 repo-stats 快照；失败时只报告一次并跳过快照比对 */
function readRepoStats() {
  if (!existsSync(repoStatsPath)) {
    report(repoStatsPath, "缺少 GitHub 统计快照，请运行 pnpm repo-stats");
    return null;
  }

  try {
    const stats = JSON.parse(readFileSync(repoStatsPath, "utf8"));
    if (!stats || typeof stats !== "object" || Array.isArray(stats)) {
      report(repoStatsPath, '内容必须是 { "owner/repo": stats } 对象');
      return null;
    }
    return stats;
  } catch (error) {
    report(repoStatsPath, `JSON 解析失败：${error.message}`);
    return null;
  }
}

function requireNonEmptyString(data, key, filePath) {
  const value = data[key];
  if (typeof value !== "string" || value.trim() === "") {
    report(filePath, `${key} 缺失或为空（需要非空字符串）`);
  }
}

function validateTags(data, filePath) {
  if (data.tags === undefined) return;
  if (!Array.isArray(data.tags)) {
    report(filePath, "tags 必须是字符串数组");
    return;
  }
  data.tags.forEach((tag, index) => {
    if (typeof tag !== "string" || tag.trim() === "") {
      report(filePath, `tags[${index}] 必须是非空字符串`);
    }
  });
}

function validateMetrics(data, filePath) {
  if (data.metrics === undefined) return;
  if (!Array.isArray(data.metrics)) {
    report(filePath, "metrics 必须是 { label, value } 数组");
    return;
  }
  data.metrics.forEach((metric, index) => {
    if (!metric || typeof metric !== "object" || Array.isArray(metric)) {
      report(filePath, `metrics[${index}] 必须是 { label, value } 对象`);
      return;
    }
    for (const key of ["label", "value"]) {
      if (typeof metric[key] !== "string" || metric[key].trim() === "") {
        report(filePath, `metrics[${index}].${key} 必须是非空字符串`);
      }
    }
  });
}

function validateImage(data, filePath) {
  if (data.image === undefined) return; // 省略时由 schema 回退到占位图
  if (typeof data.image !== "string" || data.image.trim() === "") {
    report(filePath, "image 缺失或为空（需要 public/ 下的绝对路径）");
    return;
  }

  const image = data.image.trim();
  if (!image.startsWith("/")) {
    report(filePath, `image 必须以 / 开头并指向 public/（当前为 "${image}"）`);
    return;
  }

  const imageFile = resolve(publicRoot, `.${image}`);
  const insidePublic = relative(publicRoot, imageFile);
  if (insidePublic.startsWith("..") || isAbsolute(insidePublic)) {
    report(filePath, `image 越出了 public/ 目录："${image}"`);
    return;
  }

  if (!existsSync(imageFile) || !statSync(imageFile).isFile()) {
    report(filePath, `image 文件不存在：public${image}`);
  }
}

function validateGithub(data, filePath, repoStats) {
  if (data.github === undefined) return;
  if (typeof data.github !== "string" || data.github.trim() === "") {
    report(filePath, "github 必须是非空的绝对 URL");
    return;
  }

  const raw = data.github.trim();
  let url;
  try {
    url = new URL(raw);
  } catch {
    report(filePath, `github URL 不合法："${raw}"`);
    return;
  }

  if (url.protocol !== "https:" && url.protocol !== "http:") {
    report(filePath, `github URL 必须使用 http(s)："${raw}"`);
    return;
  }
  if (url.hostname !== "github.com" && url.hostname !== "www.github.com") {
    report(filePath, `github URL 必须指向 github.com："${raw}"`);
    return;
  }

  const segments = url.pathname.replace(/\/+$/, "").split("/").filter(Boolean);
  if (segments.length !== 2) {
    report(filePath, `github URL 必须形如 https://github.com/owner/repo："${raw}"`);
    return;
  }

  const key = segments.join("/");
  if (repoStats && !Object.hasOwn(repoStats, key)) {
    report(
      filePath,
      `GitHub 仓库 ${key} 缺少 lib/repo-stats.json 快照，请运行 pnpm repo-stats 后重试`
    );
  }
}

/**
 * 读取一种语言的项目，并逐项校验 frontmatter。
 * @returns {Map<string, { filePath: string, date: string | null, featured: boolean | null }>}
 */
function readCollection(locale, repoStats) {
  const dir = join(contentRoot, locale);
  const projects = new Map();

  if (!existsSync(dir)) {
    errors.push(`content/projects/${locale}: 目录不存在`);
    return projects;
  }

  const files = readdirSync(dir)
    .filter((file) => file.endsWith(".mdx"))
    .sort();

  for (const file of files) {
    const filePath = join(dir, file);
    const slug = file.slice(0, -".mdx".length);

    let data;
    try {
      ({ data } = matter(readFileSync(filePath, "utf8")));
    } catch (error) {
      report(filePath, `frontmatter 解析失败：${error.message}`);
      continue;
    }

    requireNonEmptyString(data, "title", filePath);
    requireNonEmptyString(data, "description", filePath);

    let date = null;
    if (typeof data.date !== "string" || data.date.trim() === "") {
      report(filePath, "date 缺失或为空（需要带引号的 YYYY-MM-DD 字符串）");
    } else if (!isValidCalendarDate(data.date)) {
      report(filePath, `date 不是合法的 YYYY-MM-DD 日期："${data.date}"`);
    } else {
      date = data.date;
    }

    let featured = null;
    if (data.featured !== undefined && typeof data.featured !== "boolean") {
      report(filePath, "featured 必须是布尔值 true/false");
    } else {
      featured = data.featured === true;
    }

    validateTags(data, filePath);
    validateMetrics(data, filePath);
    validateImage(data, filePath);
    validateGithub(data, filePath, repoStats);

    projects.set(slug, { filePath, date, featured });
  }

  return projects;
}

const repoStats = readRepoStats();
const collections = Object.fromEntries(
  locales.map((locale) => [locale, readCollection(locale, repoStats)])
);

const [zhProjects, enProjects] = [collections.zh, collections.en];
for (const slug of new Set([...zhProjects.keys(), ...enProjects.keys()])) {
  const zhProject = zhProjects.get(slug);
  const enProject = enProjects.get(slug);

  if (!zhProject) {
    errors.push(`项目 ${slug} 缺少中文版本：content/projects/zh/${slug}.mdx`);
    continue;
  }
  if (!enProject) {
    errors.push(`项目 ${slug} 缺少英文版本：content/projects/en/${slug}.mdx`);
    continue;
  }

  if (zhProject.date && enProject.date && zhProject.date !== enProject.date) {
    errors.push(
      `项目 ${slug} 的中英 date 不一致：${zhProject.date}（zh）vs ${enProject.date}（en）`
    );
  }
  if (
    zhProject.featured !== null &&
    enProject.featured !== null &&
    zhProject.featured !== enProject.featured
  ) {
    errors.push(
      `项目 ${slug} 的中英 featured 不一致：${zhProject.featured}（zh）vs ${enProject.featured}（en）`
    );
  }
}

if (errors.length > 0) {
  console.error(`内容检查失败：共 ${errors.length} 个问题`);
  for (const message of errors) console.error(`  - ${message}`);
  process.exit(1);
}

console.log(
  `内容检查通过：zh ${zhProjects.size} 个项目，en ${enProjects.size} 个项目；` +
    "封面图、GitHub 快照与跨语言一致性正常。"
);
