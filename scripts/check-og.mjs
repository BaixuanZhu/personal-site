/**
 * OG 图片检查：`pnpm check:og`（已并入 `pnpm check` 与 build 前置链）。
 *
 * 从 content/projects/{zh,en}/ 推导期望的文件名：
 *   root.png、home-{zh,en}.png、about-{zh,en}.png、project-{slug}-{zh,en}.png。
 * 逐个校验 PNG 魔数、IHDR 宽高严格为 1200×630、单文件小于 300KB；
 * 缺失文件或 public/og/ 中多余的 .png 都会导致失败（非 png 文件如 .gitkeep 忽略）。
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const contentRoot = join(root, "content", "projects");
const ogDir = join(root, "public", "og");
const locales = ["zh", "en"];

const EXPECTED_WIDTH = 1200;
const EXPECTED_HEIGHT = 630;
const MAX_BYTES = 300 * 1024;

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

/** @type {string[]} */
const errors = [];

/** 列出某种语言的全部项目 slug */
function readSlugs(locale) {
  const dir = join(contentRoot, locale);
  if (!existsSync(dir)) {
    errors.push(`缺少内容目录：content/projects/${locale}`);
    return [];
  }
  return readdirSync(dir)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => file.slice(0, -".mdx".length))
    .sort();
}

const slugs = [...new Set(locales.flatMap(readSlugs))].sort();
if (slugs.length === 0) {
  errors.push("没有从 content/projects/ 读到任何项目，无法核对 OG 图片");
}

const expectedNames = new Set([
  "root.png",
  "home-zh.png",
  "home-en.png",
  "about-zh.png",
  "about-en.png",
  ...slugs.flatMap((slug) => locales.map((locale) => `project-${slug}-${locale}.png`)),
]);

/**
 * 读取 PNG 的 IHDR 宽高；格式不合法时返回错误描述。
 *
 * @param {string} fileName public/og/ 下的文件名
 * @returns {{ width: number, height: number } | null}
 */
function checkPng(fileName) {
  const filePath = join(ogDir, fileName);
  const bytes = readFileSync(filePath);
  const label = `public/og/${fileName}`;
  let ok = true;

  if (bytes.length < 33) {
    errors.push(`${label}: 文件过小（${bytes.length} 字节），不是有效 PNG`);
    return null;
  }
  if (!bytes.subarray(0, 8).equals(PNG_SIGNATURE)) {
    errors.push(`${label}: PNG 魔数不匹配，文件可能不是 PNG`);
    ok = false;
  }
  if (bytes.subarray(12, 16).toString("ascii") !== "IHDR") {
    errors.push(`${label}: 首个数据块不是 IHDR`);
    ok = false;
  }

  const width = bytes.readUInt32BE(16);
  const height = bytes.readUInt32BE(20);
  if (width !== EXPECTED_WIDTH || height !== EXPECTED_HEIGHT) {
    errors.push(
      `${label}: 尺寸为 ${width}×${height}，应为 ${EXPECTED_WIDTH}×${EXPECTED_HEIGHT}`,
    );
    ok = false;
  }

  const size = statSync(filePath).size;
  if (size >= MAX_BYTES) {
    errors.push(`${label}: 体积 ${(size / 1024).toFixed(1)} KB，应小于 300 KB`);
    ok = false;
  }

  return ok ? { width, height } : null;
}

if (!existsSync(ogDir)) {
  console.error("OG 检查失败：public/og/ 目录不存在，请先运行 pnpm og。");
  process.exit(1);
}

const presentFiles = readdirSync(ogDir);
for (const name of [...expectedNames].sort()) {
  if (!presentFiles.includes(name)) {
    errors.push(`public/og/${name}: 缺少文件（运行 pnpm og 重新生成）`);
    continue;
  }
  checkPng(name);
}

// 多出来的 .png 说明项目已删除/改名，需清理；非 png 文件（.gitkeep 等）忽略
for (const name of presentFiles) {
  if (!name.toLowerCase().endsWith(".png")) continue;
  if (!expectedNames.has(name)) {
    errors.push(`public/og/${name}: 多余文件（内容目录中已无对应页面）`);
  }
}

if (errors.length > 0) {
  console.error(`OG 检查失败：共 ${errors.length} 个问题`);
  for (const message of errors) console.error(`  - ${message}`);
  process.exit(1);
}

console.log(
  `OG 检查通过：${expectedNames.size} 张 PNG 均为 ${EXPECTED_WIDTH}×${EXPECTED_HEIGHT}、小于 300 KB，` +
    `与 content/projects/ 的 ${slugs.length} 个项目一致。`,
);
