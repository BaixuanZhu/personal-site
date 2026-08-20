import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import type { Locale } from "@/lib/i18n/config";

/** MDX 项目文件根目录（按语言分子目录：content/projects/{lang}/） */
const PROJECTS_ROOT = path.join(process.cwd(), "content", "projects");

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
 * frontmatter 缺失必要字段时返回 null（该文件会被跳过而非中断构建）。
 *
 * @param slug 文件名（不含扩展名），同时作为路由标识
 * @param raw 文件原始内容
 * @returns 解析成功返回项目数据，格式不合法返回 null
 */
function parseProjectFile(slug: string, raw: string): Project | null {
  const { data, content } = matter(raw);
  const { title, description, tags, image, date } = data as Record<string, unknown>;

  if (typeof title !== "string" || typeof description !== "string" || typeof date !== "string") {
    console.warn(`[projects] 跳过 ${slug}.mdx：frontmatter 缺少 title/description/date`);
    return null;
  }

  return {
    slug,
    title,
    description,
    tags: Array.isArray(tags) ? tags.map(String) : [],
    image: typeof image === "string" ? image : "/images/projects/placeholder.svg",
    date,
    github: typeof data.github === "string" ? data.github : undefined,
    demo: typeof data.demo === "string" ? data.demo : undefined,
    featured: data.featured === true,
    metrics: Array.isArray(data.metrics)
      ? (data.metrics as ProjectMetric[]).filter(
          (m) => m && typeof m.label === "string" && typeof m.value === "string"
        )
      : [],
    content,
  };
}

/**
 * 读取指定语言的全部项目，按发布日期倒序排列。
 * 语言目录不存在或为空时返回空数组。
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
      const raw = fs.readFileSync(path.join(dir, file), "utf-8");
      return parseProjectFile(slug, raw);
    })
    .filter((project): project is Project => project !== null)
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
