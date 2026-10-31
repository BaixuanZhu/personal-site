/**
 * 生成 out/index.html 根跳转页。
 * 静态导出（NEXT_OUTPUT=export）下 proxy.ts 不执行，根路径缺少语言协商入口；
 * 该页读 NEXT_LANG Cookie 跳转 /zh 或 /en，无偏好默认中文（与 proxy 逻辑一致）。
 * 子路径部署（GitHub Pages）由 BASE_PATH 环境变量提供前缀；根路径部署（EdgeOne）留空。
 * SEO 元数据使用 SITE_URL ?? NEXT_PUBLIC_SITE_URL（已含部署子路径），
 * 默认与 lib/config.ts 的 siteConfig.url 保持一致。
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const DEFAULT_SITE_URL = "https://baixuanzhu.github.io/personal-site";

const base = process.env.BASE_PATH ?? "";
const siteUrl = (
  process.env.SITE_URL ??
  process.env.NEXT_PUBLIC_SITE_URL ??
  DEFAULT_SITE_URL
).replace(/\/+$/, "");

const title = "朱柏轩 (Galaxy) | Java 后端工程师 · AI 工程化";
const description =
  "朱柏轩（Galaxy）的个人作品集 —— Java 后端工程师，打造开源开发者工具、MCP 服务与 AI Agent 技能。";
const siteName = "朱柏轩 (Galaxy)";

/** HTML 文本/属性转义，避免环境变量中的引号或尖括号破坏标签 */
function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** JS 字符串字面量转义（用于内联脚本），同时防止 </script> 提前闭合 */
function escapeJsString(value) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\r/g, "\\r")
    .replace(/\n/g, "\\n")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029")
    .replace(/</g, "\\u003c");
}

const html = `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:url" content="${escapeHtml(`${siteUrl}/`)}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="${escapeHtml(siteName)}" />
    <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />
    <meta name="theme-color" content="#0a0a0a" media="(prefers-color-scheme: dark)" />
    <meta name="robots" content="noindex" />
    <script>
      var m = document.cookie.match(/(?:^|;\\s*)NEXT_LANG=(zh|en)\\b/);
      var base = "${escapeJsString(base)}";
      window.location.replace(m ? base + "/" + m[1] + "/" : base + "/zh/");
    </script>
    <noscript><meta http-equiv="refresh" content="0;url=${escapeHtml(base)}/zh/" /></noscript>
  </head>
  <body></body>
</html>
`;

mkdirSync("out", { recursive: true });
writeFileSync(join("out", "index.html"), html);
console.log(
  `out/index.html written (BASE_PATH="${base}", SITE_URL="${siteUrl}")`,
);
