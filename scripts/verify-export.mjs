/**
 * 静态导出验收：`pnpm verify:export`（需先完成静态导出构建）。
 *
 * 检查首页、关于页、全部项目页、404、sitemap 与 robots 是否存在且内容有效。
 * 当前只做基础完整性检查，SEO/OG 任务可在此基础上扩展。
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "out");
const contentRoot = join(root, "content", "projects");
const locales = ["zh", "en"];

/** @type {string[]} */
const errors = [];

function readTextFile(relativePath) {
  const filePath = join(outDir, relativePath);
  if (!existsSync(filePath)) {
    errors.push(`缺少文件：out/${relativePath}`);
    return null;
  }
  try {
    return readFileSync(filePath, "utf8");
  } catch (error) {
    errors.push(`无法读取 out/${relativePath}：${error.message}`);
    return null;
  }
}

function checkTitle(relativePath, html) {
  if (html === null) return;
  const match = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html);
  if (!match || match[1].replace(/&nbsp;/gi, " ").trim() === "") {
    errors.push(`out/${relativePath}: <title> 缺失或为空`);
  }
}

if (!existsSync(outDir)) {
  console.error("export check failed: out/ not found — run pnpm build first.");
  process.exit(1);
}
if (!statSync(outDir).isDirectory()) {
  console.error("export check failed: out is not a directory — run pnpm build first.");
  process.exit(1);
}

const htmlPages = [
  "zh/index.html",
  "en/index.html",
  "zh/about/index.html",
  "en/about/index.html",
  "404.html",
];

// 从内容目录推导全部项目页（trailingSlash 为 true 时输出为 <slug>/index.html）
for (const locale of locales) {
  const projectDir = join(contentRoot, locale);
  if (!existsSync(projectDir)) {
    errors.push(`缺少内容目录：content/projects/${locale}`);
    continue;
  }

  const slugs = readdirSync(projectDir)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => file.slice(0, -".mdx".length))
    .sort();

  if (slugs.length === 0) {
    errors.push(`content/projects/${locale} 没有项目，无法验证项目页导出`);
  }
  for (const slug of slugs) {
    htmlPages.push(`${locale}/projects/${slug}/index.html`);
  }
}

/** @type {Map<string, string | null>} */
const htmlByPage = new Map();
for (const relativePath of htmlPages) {
  const html = readTextFile(relativePath);
  htmlByPage.set(relativePath, html);
  checkTitle(relativePath, html);
}

// 404 必须足够完整，且明确表达“页面不存在”
const notFoundHtml = htmlByPage.get("404.html");
if (notFoundHtml !== null && notFoundHtml !== undefined) {
  const notFoundSize = statSync(join(outDir, "404.html")).size;
  if (notFoundSize <= 1000) {
    errors.push(`out/404.html 体积仅 ${notFoundSize} 字节，应大于 1000 字节`);
  }
  if (!notFoundHtml.includes("404") && !notFoundHtml.includes("Page Not Found")) {
    errors.push('out/404.html 未包含 "404" 或 "Page Not Found"');
  }
}

// sitemap：至少 16 个 URL（当前基线为 2 个首页 + 2 个关于页 + 12 个项目页）
const sitemap = readTextFile("sitemap.xml");
let sitemapUrlCount = 0;
if (sitemap !== null) {
  sitemapUrlCount = (sitemap.match(/<url>/g) ?? []).length;
  if (sitemapUrlCount < 16) {
    errors.push(`out/sitemap.xml 仅含 ${sitemapUrlCount} 个 <url>，至少需要 16 个`);
  }
}

// robots 必须声明 sitemap 地址
const robots = readTextFile("robots.txt");
if (robots !== null) {
  if (robots.trim() === "") {
    errors.push("out/robots.txt 为空");
  } else if (!/sitemap\s*:/i.test(robots)) {
    errors.push("out/robots.txt 未声明 Sitemap");
  }
}

if (errors.length > 0) {
  console.error(`导出检查失败：共 ${errors.length} 个问题`);
  for (const message of errors) console.error(`  - ${message}`);
  process.exit(1);
}

console.log(
  `导出检查通过：${htmlPages.length} 个 HTML 页面、404.html、` +
    `sitemap.xml（${sitemapUrlCount} 个 URL）与 robots.txt 均正常。`
);
