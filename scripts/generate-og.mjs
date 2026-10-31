/**
 * OG 社交分享图生成：`pnpm og`（本地执行，产物需一并提交）。
 *
 * 为根跳转页、首页、关于页、项目索引页与全部项目页生成 1200×630 PNG 到 public/og/。
 * 模板是纯内联 CSS 的静态 HTML，写入系统临时目录后用无头 Chrome/Edge 截图，
 * 结束后清理临时文件，因此重复执行结果稳定、无运行时依赖。
 *
 * 浏览器查找顺序：CHROME_PATH 环境变量 → Windows/macOS/Linux 常见安装路径。
 */
import { spawnSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import matter from "gray-matter";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const contentRoot = join(root, "content", "projects");
const publicRoot = join(root, "public");
const ogDir = join(publicRoot, "og");

const IMAGE_WIDTH = 1200;
const IMAGE_HEIGHT = 630;

// 与其他脚本 / lib/config.ts 使用同一套站点地址来源（已包含部署子路径）
const siteUrl = (
  process.env.SITE_URL ??
  process.env.NEXT_PUBLIC_SITE_URL ??
  "https://baixuanzhu.github.io/personal-site"
).replace(/\/+$/, "");

/** Windows / macOS / Linux 上常见的 Chromium 系浏览器路径 */
const BROWSER_CANDIDATES = [
  // Windows
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  join(process.env.LOCALAPPDATA ?? "", "Google", "Chrome", "Application", "chrome.exe"),
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  join(process.env.LOCALAPPDATA ?? "", "Microsoft", "Edge", "Application", "msedge.exe"),
  // macOS
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  // Linux
  "/usr/bin/google-chrome",
  "/usr/bin/google-chrome-stable",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
  "/usr/bin/microsoft-edge",
  "/usr/bin/microsoft-edge-stable",
  "/snap/bin/chromium",
];

/**
 * 查找可用的无头浏览器。
 *
 * @returns {string} 浏览器可执行文件的绝对路径
 */
function findBrowser() {
  const fromEnv = process.env.CHROME_PATH;
  if (fromEnv) {
    if (existsSync(fromEnv)) return fromEnv;
    throw new Error(
      `CHROME_PATH 指向的文件不存在：${fromEnv}\n` +
        "请把它设置为 Chrome/Edge/Chromium 可执行文件，或删除该变量以使用自动探测。",
    );
  }

  for (const candidate of BROWSER_CANDIDATES) {
    if (!candidate || !existsSync(candidate)) continue;
    try {
      if (statSync(candidate).isFile()) return candidate;
    } catch {
      // 权限不足等异常直接跳过该候选路径
    }
  }

  throw new Error(
    "未找到可用的 Chrome/Edge/Chromium，无法生成 OG 图片。\n" +
      "请安装 Chrome 或 Edge，或用 CHROME_PATH 指定浏览器可执行文件。\n" +
      `已尝试的路径：\n${BROWSER_CANDIDATES.filter(Boolean)
        .map((item) => `  - ${item}`)
        .join("\n")}`,
  );
}

/** HTML 文本/属性转义 */
function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** 把截断文本统一做成 “…” 结尾（去掉尾部空白与标点） */
function ellipsize(value, maxWeighted) {
  if (weightedLength(value) <= maxWeighted) return value;

  let result = "";
  let weight = 0;
  for (const char of value) {
    const next = weight + charWeight(char);
    if (next > maxWeighted - 1) break;
    result += char;
    weight = next;
  }
  return `${result.replace(/[\s,，、;；:：.\-—]+$/u, "")}…`;
}

/** CJK 字符按 1 个宽度计，拉丁字母/数字按约 0.52 个宽度计 */
function charWeight(char) {
  if (/[\u2e80-\u9fff\uf900-\ufaff\uff00-\uffef]/.test(char)) return 1;
  if (char === "—" || char === "–") return 1;
  if (char === " ") return 0.26;
  return 0.52;
}

function weightedLength(value) {
  let total = 0;
  for (const char of value) total += charWeight(char);
  return total;
}

/**
 * 标题字号：按“视觉长度”分档，保证最长标题两行内不溢出。
 */
function titleFontSize(title) {
  const length = weightedLength(title);
  if (length <= 12) return 84;
  if (length <= 18) return 72;
  if (length <= 24) return 64;
  if (length <= 34) return 56;
  if (length <= 48) return 48;
  return 42;
}

/** 描述字号：英文长句降到 21/20px，避免被两行 clamp 截成半个单词 */
function descFontSize(lines) {
  const longest = Math.max(0, ...lines.map(weightedLength));
  if (longest > 90) return 20;
  if (longest > 82) return 21;
  return 22;
}

/** 页脚展示用的站点地址（去掉协议，保留部署子路径） */
function displayUrl(path) {
  const url = new URL(siteUrl);
  const basePath = url.pathname.replace(/\/+$/, "");
  return `${url.host}${basePath}${path}`;
}

/**
 * 渲染 1200×630 的静态 HTML 模板（仅内联 CSS）。
 */
function renderHtml({ lang, eyebrow, title, description, tags, localeLabel, path, role }) {
  const size = titleFontSize(title);
  const descLines = Array.isArray(description) ? description : [description];
  const descSize = descFontSize(descLines);
  const descHtml = descLines
    .filter(Boolean)
    .map((line) => `<p class="desc">${escapeHtml(ellipsize(line, 150))}</p>`)
    .join("\n        ");
  const tagsHtml =
    tags && tags.length > 0
      ? `<div class="tags">${tags
          .map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`)
          .join("")}</div>`
      : "";

  return `<!doctype html>
<html lang="${escapeHtml(lang)}">
<head>
<meta charset="utf-8" />
<title>${escapeHtml(title)}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: ${IMAGE_WIDTH}px; height: ${IMAGE_HEIGHT}px; }
  body {
    margin: 0;
    overflow: hidden;
    background: #06070b;
    color: #f7f8fb;
    font-family: "Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI",
      "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Noto Sans CJK SC",
      "Source Han Sans SC", sans-serif;
    -webkit-font-smoothing: antialiased;
    text-rendering: optimizeLegibility;
  }
  .canvas {
    position: relative;
    width: ${IMAGE_WIDTH}px;
    height: ${IMAGE_HEIGHT}px;
    padding: 72px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    overflow: hidden;
    background:
      radial-gradient(880px 520px at 8% -12%, rgba(99, 132, 255, 0.22) 0%, rgba(99, 132, 255, 0) 62%),
      radial-gradient(720px 460px at 106% 112%, rgba(45, 212, 191, 0.14) 0%, rgba(45, 212, 191, 0) 62%),
      linear-gradient(180deg, #0c0f18 0%, #08090e 52%, #050507 100%);
  }
  .grid {
    position: absolute;
    inset: -1px;
    background-image:
      linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
    background-size: 64px 64px;
    -webkit-mask-image: radial-gradient(920px 580px at 22% 16%, #000 0%, transparent 76%);
    mask-image: radial-gradient(920px 580px at 22% 16%, #000 0%, transparent 76%);
    opacity: 0.55;
  }
  .glow-line {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, rgba(99, 132, 255, 0.95) 0%, rgba(45, 212, 191, 0.55) 46%, rgba(99, 132, 255, 0) 88%);
  }
  .top {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
  }
  .brand {
    display: flex;
    align-items: center;
    gap: 16px;
    font-size: 26px;
    font-weight: 600;
    letter-spacing: 0.01em;
    color: #eef1f8;
    white-space: nowrap;
  }
  .mark {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: linear-gradient(135deg, #8ba4ff 0%, #40e0d0 100%);
    box-shadow: 0 0 22px rgba(120, 150, 255, 0.65);
  }
  .brand .latin { color: #97a1b8; font-weight: 500; }
  .locale {
    font-size: 18px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: #aab3c8;
    border: 1px solid rgba(255, 255, 255, 0.14);
    border-radius: 999px;
    padding: 8px 20px;
    background: rgba(255, 255, 255, 0.04);
    white-space: nowrap;
  }
  .middle { position: relative; min-height: 0; }
  .eyebrow {
    font-size: 18px;
    letter-spacing: 0.24em;
    text-transform: uppercase;
    color: #8ea2ff;
    font-weight: 600;
  }
  h1 {
    margin-top: 18px;
    font-size: ${size}px;
    line-height: 1.08;
    letter-spacing: -0.02em;
    font-weight: 700;
    color: #fbfcff;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
  }
  .desc {
    margin-top: 22px;
    font-size: ${descSize}px;
    line-height: 1.5;
    color: #a7b0c4;
    max-width: 1040px;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
  }
  .desc + .desc { margin-top: 6px; }
  .tags {
    margin-top: 28px;
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    max-width: 1040px;
    max-height: 86px;
    overflow: hidden;
  }
  .tag {
    font-size: 18px;
    color: #c8d0e2;
    border: 1px solid rgba(255, 255, 255, 0.12);
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    padding: 7px 16px;
    white-space: nowrap;
  }
  .bottom { position: relative; }
  .rule {
    height: 1px;
    margin-bottom: 22px;
    background: linear-gradient(90deg, rgba(255, 255, 255, 0.22) 0%, rgba(255, 255, 255, 0.05) 62%, rgba(255, 255, 255, 0) 100%);
  }
  .foot {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
    font-size: 19px;
    color: #7f889e;
  }
  .url {
    font-family: ui-monospace, "SFMono-Regular", "Cascadia Mono", Menlo, Consolas, monospace;
    color: #9aa3b8;
    letter-spacing: 0.01em;
  }
  .role { letter-spacing: 0.08em; white-space: nowrap; }
</style>
</head>
<body>
  <div class="canvas">
    <div class="grid"></div>
    <div class="glow-line"></div>
    <div class="top">
      <div class="brand"><span class="mark"></span>朱柏轩 <span class="latin">(Galaxy)</span></div>
      <div class="locale">${escapeHtml(localeLabel)}</div>
    </div>
    <div class="middle">
      <p class="eyebrow">${escapeHtml(eyebrow)}</p>
      <h1>${escapeHtml(title)}</h1>
      ${descHtml}
      ${tagsHtml}
    </div>
    <div class="bottom">
      <div class="rule"></div>
      <div class="foot">
        <span class="url">${escapeHtml(displayUrl(path))}</span>
        <span class="role">${escapeHtml(role)}</span>
      </div>
    </div>
  </div>
</body>
</html>
`;
}

/** 通用页面文案（首页 / 关于页 / 根入口；项目页文案来自 MDX frontmatter） */
const STATIC_PAGES = {
  root: {
    file: "root.png",
    lang: "zh-CN",
    eyebrow: "PORTFOLIO · 个人作品集",
    title: "朱柏轩 (Galaxy)",
    description: [
      "Java 后端工程师 · Java Backend Engineer",
      "开源开发者工具 · MCP 服务 · AI Agent 技能",
    ],
    tags: ["Developer Tools", "MCP", "AI Agent Skills", "Java Backend"],
    localeLabel: "ZH / EN",
    path: "/",
    role: "JAVA BACKEND · AI TOOLING",
  },
  "home-zh": {
    file: "home-zh.png",
    lang: "zh-CN",
    eyebrow: "首页 · HOME",
    title: "朱柏轩 (Galaxy)",
    description: "Java 后端工程师 —— 打造开源开发者工具、MCP 服务与 AI Agent 技能。",
    tags: ["Java", "Spring Boot", "MCP", "AI Agent"],
    localeLabel: "中文",
    path: "/zh/",
    role: "JAVA 后端 · AI 工程化",
  },
  "home-en": {
    file: "home-en.png",
    lang: "en",
    eyebrow: "HOME · 首页",
    title: "Galaxy (朱柏轩)",
    description:
      "Java backend engineer building open-source developer tools, MCP servers and AI agent skills.",
    tags: ["Java", "Spring Boot", "MCP", "AI Agent"],
    localeLabel: "EN",
    path: "/en/",
    role: "JAVA BACKEND · AI TOOLING",
  },
  "about-zh": {
    file: "about-zh.png",
    lang: "zh-CN",
    eyebrow: "关于 · ABOUT",
    title: "关于我",
    description:
      "Java 后端工程师，支持远程协作 —— 把工程知识沉淀成开发者工具与 AI Agent 技能。",
    tags: ["Java", "Spring Boot", "Open Source", "AI Tooling"],
    localeLabel: "中文",
    path: "/zh/about/",
    role: "ABOUT · 关于",
  },
  "about-en": {
    file: "about-en.png",
    lang: "en",
    eyebrow: "ABOUT · 关于",
    title: "About Me",
    description:
      "A Java backend engineer, open to remote work, turning engineering knowledge into developer tools and AI agent skills.",
    tags: ["Java", "Spring Boot", "Open Source", "AI Tooling"],
    localeLabel: "EN",
    path: "/en/about/",
    role: "ABOUT · 关于",
  },
  "projects-zh": {
    file: "projects-zh.png",
    lang: "zh-CN",
    eyebrow: "项目 · PROJECTS",
    title: "全部开源项目",
    description:
      "从 Java 版本管理器到面向 AI Agent 的文件操作与 MCP 服务，每个项目都源于真实工作流中的痛点。",
    tags: ["DevTools", "jvm", "FileX", "Danbooru Tag MCP", "Agent Skills", "Hooks"],
    localeLabel: "中文",
    path: "/zh/projects/",
    role: "OPEN SOURCE · 开源项目",
  },
  "projects-en": {
    file: "projects-en.png",
    lang: "en",
    eyebrow: "PROJECTS · 项目",
    title: "All Open-Source Projects",
    description:
      "From Java version management to file operations and MCP services for AI agents — every project starts from a real pain point.",
    tags: ["DevTools", "jvm", "FileX", "Danbooru Tag MCP", "Agent Skills", "Hooks"],
    localeLabel: "EN",
    path: "/en/projects/",
    role: "OPEN SOURCE · 开源项目",
  },
};

/**
 * 读取一种语言的项目 frontmatter。
 *
 * @returns {Map<string, { title: string, description: string, tags: string[] }>}
 */
function readProjects(locale) {
  const dir = join(contentRoot, locale);
  if (!existsSync(dir)) {
    throw new Error(`缺少内容目录：content/projects/${locale}`);
  }

  const projects = new Map();
  for (const file of readdirSync(dir).filter((name) => name.endsWith(".mdx")).sort()) {
    const slug = file.slice(0, -".mdx".length);
    const { data } = matter(readFileSync(join(dir, file), "utf8"));
    projects.set(slug, {
      title: typeof data.title === "string" ? data.title : slug,
      description: typeof data.description === "string" ? data.description : "",
      tags: Array.isArray(data.tags)
        ? data.tags.filter((tag) => typeof tag === "string").slice(0, 4)
        : [],
    });
  }
  return projects;
}

/**
 * 汇总全部待生成图片：文件名 + 模板数据。
 *
 * @returns {Array<Record<string, unknown> & { file: string }>}
 */
function buildTargets() {
  const targets = [STATIC_PAGES.root];
  for (const locale of ["zh", "en"]) {
    targets.push(
      STATIC_PAGES[`home-${locale}`],
      STATIC_PAGES[`about-${locale}`],
      STATIC_PAGES[`projects-${locale}`],
    );

    const projects = readProjects(locale);
    if (projects.size === 0) {
      throw new Error(`content/projects/${locale} 没有项目，无法生成 OG 图片`);
    }
    const isZh = locale === "zh";
    for (const [slug, project] of projects) {
      targets.push({
        file: `project-${slug}-${locale}.png`,
        lang: isZh ? "zh-CN" : "en",
        eyebrow: isZh ? "开源项目 · PROJECT" : "PROJECT · 开源项目",
        title: project.title,
        description: project.description,
        tags: project.tags,
        localeLabel: isZh ? "中文" : "EN",
        path: `/${locale}/projects/${slug}/`,
        role: "OPEN SOURCE · 开源项目",
      });
    }
  }
  return targets;
}

/**
 * 用无头浏览器把一个 HTML 文件截图为 PNG。
 * 先尝试 --headless=new，失败后退回旧版 --headless；两次都失败则抛错。
 */
function capture(browser, profileDir, htmlPath, pngPath) {
  const fileUrl = pathToFileURL(htmlPath).href;
  const commonArgs = [
    "--disable-gpu",
    "--hide-scrollbars",
    "--force-device-scale-factor=1",
    "--window-size=1200,630",
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-extensions",
    "--disable-background-networking",
    "--disable-sync",
    "--disable-dev-shm-usage",
    "--no-sandbox",
    "--allow-file-access-from-files",
    `--user-data-dir=${profileDir}`,
    `--screenshot=${pngPath}`,
    fileUrl,
  ];

  let lastError = "";
  for (const mode of ["--headless=new", "--headless"]) {
    rmSync(pngPath, { force: true });
    const result = spawnSync(browser, [mode, ...commonArgs], {
      windowsHide: true,
      stdio: "pipe",
      timeout: 120_000,
    });

    if (existsSync(pngPath) && statSync(pngPath).size > 0) {
      return { mode, size: statSync(pngPath).size };
    }

    const stderr = (result.stderr ?? "").toString().trim();
    const stdout = (result.stdout ?? "").toString().trim();
    lastError = [result.error?.message, stderr, stdout]
      .filter(Boolean)
      .join(" | ")
      .slice(0, 600);
  }

  throw new Error(
    `截图失败：${pngPath}\n  浏览器：${browser}\n  详情：${lastError || "无输出"}`,
  );
}

let browser;
try {
  browser = findBrowser();
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
console.log(`OG 浏览器：${browser}`);

const targets = buildTargets();
const expected = new Set(targets.map((target) => target.file));

mkdirSync(ogDir, { recursive: true });

// 清掉不再需要的旧 PNG（项目改名/删除后不应残留）
for (const file of readdirSync(ogDir)) {
  if (!file.endsWith(".png")) continue;
  if (expected.has(file)) continue;
  rmSync(join(ogDir, file), { force: true });
  console.log(`  清理过期图片：public/og/${file}`);
}

const tempDir = mkdtempSync(join(tmpdir(), "og-image-"));
const profileDir = join(tempDir, "chrome-profile");
mkdirSync(profileDir, { recursive: true });

let failures = 0;
try {
  for (const target of targets) {
    const htmlName = target.file.replace(/\.png$/, ".html");
    const htmlPath = join(tempDir, htmlName);
    const pngPath = join(ogDir, target.file);

    writeFileSync(htmlPath, renderHtml(target), "utf8");
    try {
      const { mode, size } = capture(browser, profileDir, htmlPath, pngPath);
      console.log(
        `  ✓ public/og/${target.file} (${(size / 1024).toFixed(1)} KB, ${mode})`,
      );
    } catch (error) {
      failures += 1;
      console.error(`  ✗ ${target.file}: ${error.message}`);
    }
  }
} finally {
  rmSync(tempDir, { recursive: true, force: true });
}

if (failures > 0) {
  console.error(`OG 图片生成失败：${failures}/${targets.length} 张未生成。`);
  process.exit(1);
}

console.log(
  `OG 图片生成完成：${targets.length} 张 1200×630 PNG 已写入 public/og/（站点地址 ${siteUrl}）。`,
);
