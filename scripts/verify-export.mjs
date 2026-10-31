/**
 * 静态导出验收：`pnpm verify:export`（需先完成静态导出构建）。
 *
 * 检查首页、关于页、项目索引页、全部项目页、404、sitemap、robots 与根跳转页是否存在；
 * 页面还需通过 canonical、hreflang、Open Graph 与 JSON-LD 的 SEO 检查。
 * 根跳转页由 scripts/gen-root-redirect.mjs 生成，需在本脚本之前执行。
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "out");
const contentRoot = join(root, "content", "projects");
const locales = ["zh", "en"];

// 与 lib/config.ts / scripts/gen-root-redirect.mjs 使用同一套站点地址来源
const siteUrl = (
  process.env.SITE_URL ??
  process.env.NEXT_PUBLIC_SITE_URL ??
  "https://baixuanzhu.github.io/personal-site"
).replace(/\/+$/, "");

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

/** 解码 HTML 实体，便于比较 URL / 文案 */
function decodeHtml(value) {
  return value
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&#x27;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
}

/** 提取指定标签的全部开始标签（如 link/meta/script） */
function getTags(html, tagName) {
  return html.match(new RegExp(`<${tagName}\\b[^>]*>`, "gi")) ?? [];
}

/** 读取标签中的属性值（属性名大小写不敏感） */
function getAttribute(tag, name) {
  const pattern = new RegExp(
    `(?:^|\\s)${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s"'=<>]+))`,
    "i",
  );
  const match = pattern.exec(tag);
  if (!match) return null;
  return decodeHtml(match[1] ?? match[2] ?? match[3] ?? "");
}

/** 按 rel 筛选 link 标签（支持 rel 中包含多个空格分隔值） */
function getLinksByRel(html, rel) {
  return getTags(html, "link").filter((tag) => {
    const value = getAttribute(tag, "rel");
    return value !== null && value.split(/\s+/).includes(rel);
  });
}

/** 读取 meta 标签的 content 列表（过滤空值） */
function getMetaValues(html, attribute, key) {
  return getTags(html, "meta")
    .filter((tag) => getAttribute(tag, attribute) === key)
    .map((tag) => getAttribute(tag, "content"))
    .filter((value) => value !== null && value.trim() !== "");
}

/** 递归收集 JSON-LD 中的全部 @type（支持数组与 @graph） */
function collectTypes(value, types) {
  if (Array.isArray(value)) {
    for (const item of value) collectTypes(item, types);
    return;
  }
  if (value === null || typeof value !== "object") return;

  const type = value["@type"];
  if (typeof type === "string") types.add(type);
  else if (Array.isArray(type)) {
    for (const item of type) {
      if (typeof item === "string") types.add(item);
    }
  }
  for (const item of Object.values(value)) collectTypes(item, types);
}

/**
 * 校验分享图地址：必须是站点地址下的绝对 .png URL，
 * 且能在 public/ 下找到对应文件（避免社交平台抓到 404）。
 *
 * @param pageLabel 出错时展示的页面路径
 * @param tagLabel 出错时展示的标签名（og:image / twitter:image）
 * @param url meta content 中的图片地址
 */
function checkShareImage(pageLabel, tagLabel, url) {
  if (!/^https?:\/\//i.test(url)) {
    errors.push(`${pageLabel}: ${tagLabel} 必须是绝对 URL（当前为 ${url}）`);
    return;
  }
  if (!url.toLowerCase().endsWith(".png")) {
    errors.push(`${pageLabel}: ${tagLabel} 必须是 .png 地址（当前为 ${url}）`);
    return;
  }
  if (url !== siteUrl && !url.startsWith(`${siteUrl}/`)) {
    errors.push(`${pageLabel}: ${tagLabel} 未指向站点地址 ${siteUrl}（当前为 ${url}）`);
    return;
  }

  const relativePath = url.slice(siteUrl.length).replace(/^\/+/, "").split(/[?#]/)[0];
  const filePath = join(root, "public", relativePath);
  if (!relativePath || !existsSync(filePath) || !statSync(filePath).isFile()) {
    errors.push(`${pageLabel}: ${tagLabel} 指向的文件不存在：public/${relativePath}`);
  }
}

function checkTitle(relativePath, html) {
  if (html === null) return;
  const match = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html);
  if (!match || match[1].replace(/&nbsp;/gi, " ").trim() === "") {
    errors.push(`out/${relativePath}: <title> 缺失或为空`);
  }
}

/**
 * 校验单个页面的 SEO 标签。
 *
 * @param {{
 *   relativePath: string;
 *   locale: string;
 *   path: string;
 *   ogType: "website" | "article";
 *   jsonLdTypes: string[];
 * }} page
 */
function checkPageSeo({ relativePath, locale, path, ogType, jsonLdTypes }) {
  const html = htmlByPage.get(relativePath);
  if (html === null || html === undefined) return;

  const label = `out/${relativePath}`;
  const zhUrl = `${siteUrl}/zh${path}`;
  const enUrl = `${siteUrl}/en${path}`;
  const expectedCanonical = `${siteUrl}/${locale}${path}`;
  const expectedLocale = locale === "zh" ? "zh_CN" : "en_US";

  // canonical 必须唯一且等于当前页面绝对地址
  const canonicalLinks = getLinksByRel(html, "canonical");
  if (canonicalLinks.length !== 1) {
    errors.push(
      `${label}: canonical 链接数量为 ${canonicalLinks.length}，应恰好 1 个`,
    );
  } else {
    const href = getAttribute(canonicalLinks[0], "href");
    if (href !== expectedCanonical) {
      errors.push(`${label}: canonical 为 ${href}，应为 ${expectedCanonical}`);
    }
  }

  // zh/en 指向当前页面，x-default 指向中文版本
  const alternates = new Map();
  for (const tag of getLinksByRel(html, "alternate")) {
    const lang = getAttribute(tag, "hreflang");
    if (!lang) continue;
    if (!alternates.has(lang)) alternates.set(lang, getAttribute(tag, "href"));
  }
  for (const [lang, expectedHref] of [
    ["zh", zhUrl],
    ["en", enUrl],
    ["x-default", zhUrl],
  ]) {
    const href = alternates.get(lang);
    if (!href) {
      errors.push(`${label}: 缺少 hreflang="${lang}"`);
    } else if (href !== expectedHref) {
      errors.push(
        `${label}: hreflang="${lang}" 指向 ${href}，应为 ${expectedHref}`,
      );
    }
  }

  // Open Graph：url 与 canonical 一致，类型/语言与页面一致
  for (const [property, expected] of [
    ["og:url", expectedCanonical],
    ["og:type", ogType],
    ["og:locale", expectedLocale],
  ]) {
    const values = getMetaValues(html, "property", property);
    if (values.length !== 1) {
      errors.push(`${label}: ${property} 数量为 ${values.length}，应恰好 1 个`);
    } else if (values[0] !== expected) {
      errors.push(`${label}: ${property} 为 ${values[0]}，应为 ${expected}`);
    }
  }

  // 分享图：og:image 与 twitter:image 各恰好 1 个，且都指向存在的本地 PNG
  for (const [attribute, key] of [
    ["property", "og:image"],
    ["name", "twitter:image"],
  ]) {
    const values = getMetaValues(html, attribute, key);
    if (values.length !== 1) {
      errors.push(`${label}: ${key} 数量为 ${values.length}，应恰好 1 个`);
      continue;
    }
    checkShareImage(label, key, values[0]);
  }

  // 每个页面至少含一段可解析的 JSON-LD，且包含预期的 @type
  const jsonLdContents = [];
  for (const match of html.matchAll(
    /<script\b([^>]*)>([\s\S]*?)<\/script>/gi,
  )) {
    const type = getAttribute(match[1], "type");
    if ((type ?? "").toLowerCase() !== "application/ld+json") {
      continue;
    }
    jsonLdContents.push(match[2]);
  }
  if (jsonLdContents.length === 0) {
    errors.push(`${label}: 缺少 JSON-LD`);
    return;
  }

  const types = new Set();
  jsonLdContents.forEach((content, index) => {
    try {
      collectTypes(JSON.parse(content), types);
    } catch (error) {
      errors.push(
        `${label}: 第 ${index + 1} 段 JSON-LD 无法解析（${error.message}）`,
      );
    }
  });
  for (const type of jsonLdTypes) {
    if (!types.has(type)) {
      errors.push(`${label}: JSON-LD 缺少 @type="${type}"`);
    }
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
  "zh/projects/index.html",
  "en/projects/index.html",
  "404.html",
];

/** @type {Array<{relativePath: string, locale: string, path: string, ogType: "website" | "article", jsonLdTypes: string[]}>} */
const seoPages = [
  {
    relativePath: "zh/index.html",
    locale: "zh",
    path: "/",
    ogType: "website",
    jsonLdTypes: ["Person", "WebSite"],
  },
  {
    relativePath: "en/index.html",
    locale: "en",
    path: "/",
    ogType: "website",
    jsonLdTypes: ["Person", "WebSite"],
  },
  {
    relativePath: "zh/about/index.html",
    locale: "zh",
    path: "/about/",
    ogType: "website",
    jsonLdTypes: ["ProfilePage"],
  },
  {
    relativePath: "en/about/index.html",
    locale: "en",
    path: "/about/",
    ogType: "website",
    jsonLdTypes: ["ProfilePage"],
  },
  {
    relativePath: "zh/projects/index.html",
    locale: "zh",
    path: "/projects/",
    ogType: "website",
    jsonLdTypes: ["CollectionPage"],
  },
  {
    relativePath: "en/projects/index.html",
    locale: "en",
    path: "/projects/",
    ogType: "website",
    jsonLdTypes: ["CollectionPage"],
  },
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
    const relativePath = `${locale}/projects/${slug}/index.html`;
    htmlPages.push(relativePath);
    seoPages.push({
      relativePath,
      locale,
      path: `/projects/${slug}/`,
      ogType: "article",
      jsonLdTypes: ["SoftwareSourceCode"],
    });
  }
}

/** @type {Map<string, string | null>} */
const htmlByPage = new Map();
for (const relativePath of htmlPages) {
  const html = readTextFile(relativePath);
  htmlByPage.set(relativePath, html);
  checkTitle(relativePath, html);
}

for (const page of seoPages) checkPageSeo(page);

// 根跳转页由 gen-root-redirect.mjs 生成，需包含基础社交分享与 noindex 元数据
const rootRedirectHtml = readTextFile("index.html");
if (rootRedirectHtml !== null) {
  checkTitle("index.html", rootRedirectHtml);

  if (getMetaValues(rootRedirectHtml, "name", "description").length === 0) {
    errors.push("out/index.html: 缺少 description");
  }
  if (getMetaValues(rootRedirectHtml, "property", "og:title").length === 0) {
    errors.push("out/index.html: 缺少 og:title");
  }
  if (getMetaValues(rootRedirectHtml, "property", "og:url").length === 0) {
    errors.push("out/index.html: 缺少 og:url");
  }
  if (getMetaValues(rootRedirectHtml, "name", "theme-color").length < 2) {
    errors.push("out/index.html: 缺少亮/暗两套 theme-color");
  }
  const robots = getMetaValues(rootRedirectHtml, "name", "robots");
  if (!robots.some((value) => /\bnoindex\b/i.test(value))) {
    errors.push("out/index.html: robots 缺少 noindex");
  }

  // 根跳转页也要能被社交平台预览：唯一 og:image / twitter:image，且为存在的 PNG
  for (const [attribute, key] of [
    ["property", "og:image"],
    ["name", "twitter:image"],
  ]) {
    const values = getMetaValues(rootRedirectHtml, attribute, key);
    if (values.length !== 1) {
      errors.push(`out/index.html: ${key} 数量为 ${values.length}，应恰好 1 个`);
      continue;
    }
    checkShareImage("out/index.html", key, values[0]);
  }
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

// sitemap：至少 18 个 URL（2 个首页 + 2 个关于页 + 2 个项目索引页 + 12 个项目页），
// 且每条 URL 的 hreflang 备选都包含指向中文版本的 x-default
const sitemap = readTextFile("sitemap.xml");
let sitemapUrlCount = 0;
if (sitemap !== null) {
  sitemapUrlCount = (sitemap.match(/<url>/g) ?? []).length;
  if (sitemapUrlCount < 18) {
    errors.push(`out/sitemap.xml 仅含 ${sitemapUrlCount} 个 <url>，至少需要 18 个`);
  }
  const urlBlocks = sitemap.match(/<url>[\s\S]*?<\/url>/g) ?? [];
  const missingXDefault = urlBlocks.filter(
    (block) => !/hreflang="x-default"/i.test(block),
  ).length;
  if (urlBlocks.length === 0 || missingXDefault > 0) {
    errors.push(
      `out/sitemap.xml: ${urlBlocks.length} 条 URL 中有 ${missingXDefault} 条缺少 x-default`,
    );
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
  `导出检查通过：${htmlPages.length} 个 HTML 页面、根跳转页、404.html、` +
    `sitemap.xml（${sitemapUrlCount} 个 URL）与 robots.txt 均正常。`,
);
