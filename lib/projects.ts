import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { z } from "zod";
import type { Locale } from "@/lib/i18n/config";

/** MDX 项目文件根目录（按语言分子目录：content/projects/{lang}/） */
const PROJECTS_ROOT = path.join(process.cwd(), "content", "projects");

/** 静态资源根目录（public/），用于校验 frontmatter 引用的本地封面图 */
const PUBLIC_ROOT = path.join(process.cwd(), "public");

/** frontmatter 未提供 image 时使用的默认封面图 */
const DEFAULT_PROJECT_IMAGE = "/images/projects/placeholder.svg";

/** 日期字段格式：YYYY-MM-DD */
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** 判断字符串是否为真实存在的日历日期（排除 2026-02-30 等非法日期） */
function isCalendarDate(value: string): boolean {
  if (!DATE_PATTERN.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

/**
 * 项目 frontmatter 校验规则。
 * 使用 strict 模式：字段名拼错时立即报错，而不是被静默忽略。
 */
const projectFrontmatterSchema = z.strictObject({
  title: z.string("title 必须是字符串").trim().min(1, "title 不能为空"),
  description: z.string("description 必须是字符串").trim().min(1, "description 不能为空"),
  date: z
    .string("date 必须是带引号的 YYYY-MM-DD 字符串")
    .regex(DATE_PATTERN, "date 必须符合 YYYY-MM-DD 格式")
    .refine(isCalendarDate, "date 必须是真实存在的日历日期"),
  tags: z.array(z.string("tags 中的每一项都必须是字符串"), "tags 必须是字符串数组").default([]),
  image: z
    .string("image 必须是字符串")
    .trim()
    .min(1, "image 不能为空")
    .default(DEFAULT_PROJECT_IMAGE),
  github: z.url("github 必须是合法的绝对 URL").optional(),
  demo: z.url("demo 必须是合法的绝对 URL").optional(),
  featured: z.boolean("featured 必须是布尔值").default(false),
  metrics: z
    .array(
      z.strictObject({
        label: z.string("metrics.label 必须是字符串").trim().min(1, "metrics.label 不能为空"),
        value: z.string("metrics.value 必须是字符串").trim().min(1, "metrics.value 不能为空"),
      }),
      "metrics 必须是 { label, value } 数组"
    )
    .default([]),
});

/** 项目量化成果指标（如「性能提升 40%」） */
export interface ProjectMetric {
  /** 指标名称（如「首屏加载」） */
  label: string;
  /** 指标值（如「↓ 40%」） */
  value: string;
}

/** 项目完整数据（frontmatter 与正文） */
export interface Project {
  /** 路由标识，取自文件名（不含扩展名） */
  slug: string;
  /** 项目名称 */
  title: string;
  /** 一句话简介 */
  description: string;
  /** 技术栈标签 */
  tags: string[];
  /** 预览图路径（public/ 内的绝对路径） */
  image: string;
  /** 发布日期（ISO 格式，用于排序与展示） */
  date: string;
  /** 代码仓库地址 */
  github?: string;
  /** 在线演示地址 */
  demo?: string;
  /** 是否在首页精选展示 */
  featured: boolean;
  /** 量化成果列表 */
  metrics: ProjectMetric[];
  /** MDX 正文（已剥离 frontmatter） */
  content: string;
}

/**
 * 解析单个 MDX 文件为项目数据。
 * frontmatter 不合法时抛出包含文件路径与全部字段问题的错误，让构建尽早失败。
 *
 * @param filePath MDX 文件绝对路径（用于错误信息）
 * @param slug 文件名（不含扩展名），同时作为路由标识
 * @param raw 文件原始内容
 * @returns 校验通过的项目数据
 * @throws frontmatter 缺失、类型错误、日期非法或封面图不存在时抛出
 */
function parseProjectFile(filePath: string, slug: string, raw: string): Project {
  const relativePath = path.relative(process.cwd(), filePath) || filePath;

  let data;
  let content;
  try {
    ({ data, content } = matter(raw));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`[projects] ${relativePath} 的 frontmatter YAML 解析失败：${message}`);
  }

  const result = projectFrontmatterSchema.safeParse(data);

  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => {
        const field = issue.path.length > 0 ? issue.path.join(".") : "(root)";
        return `  - ${field}: ${issue.message}`;
      })
      .join("\n");
    throw new Error(`[projects] ${relativePath} 的 frontmatter 不合法：\n${issues}`);
  }

  const { image } = result.data;
  if (image.startsWith("/")) {
    const imageFile = path.join(PUBLIC_ROOT, image.replace(/^\/+/, ""));
    if (!fs.existsSync(imageFile)) {
      throw new Error(
        `[projects] ${relativePath} 的封面图不存在：public${image}（来自 frontmatter 的 image 字段）`
      );
    }
  }

  return { slug, ...result.data, content };
}

/**
 * 读取指定语言的全部项目，按发布日期倒序排列。
 * 语言目录不存在或为空时返回空数组；任一文件 frontmatter 不合法都会抛错。
 *
 * @param locale 目标语言
 * @returns 项目列表
 */
export function getAllProjects(locale: Locale): Project[] {
  const dir = path.join(PROJECTS_ROOT, locale);
  if (!fs.existsSync(dir)) return [];

  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => {
      const slug = file.replace(/\.mdx$/, "");
      const filePath = path.join(dir, file);
      return parseProjectFile(filePath, slug, fs.readFileSync(filePath, "utf-8"));
    })
    .sort((a, b) => b.date.localeCompare(a.date));
}

/**
 * 按语言与 slug 读取单个项目（用于详情页）。
 *
 * @param locale 目标语言
 * @param slug 路由标识（文件名）
 * @returns 匹配的项目，不存在返回 null
 */
export function getProjectBySlug(locale: Locale, slug: string): Project | null {
  return getAllProjects(locale).find((project) => project.slug === slug) ?? null;
}

/**
 * 获取首页精选项目。
 * 优先返回 featured 标记的项目；若无标记则回退为全部项目。
 *
 * @param locale 目标语言
 * @returns 精选项目列表
 */
export function getFeaturedProjects(locale: Locale): Project[] {
  const all = getAllProjects(locale);
  const featured = all.filter((project) => project.featured);
  return featured.length > 0 ? featured : all;
}
