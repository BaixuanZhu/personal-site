import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/config";
import { locales } from "@/lib/i18n/config";
import { getAllProjects } from "@/lib/projects";

// 静态导出要求 metadata 路由显式声明为静态
export const dynamic = "force-static";

// siteConfig.url 已包含部署子路径（如 /personal-site），此处不再拼 basePath
const baseUrl = siteConfig.url.replace(/\/+$/, "");

/** 生成 zh/en 两个语言版本的绝对地址，用于 hreflang 备选链接 */
function alternates(path: string) {
  return {
    languages: {
      zh: `${baseUrl}/zh${path}`,
      en: `${baseUrl}/en${path}`,
    },
  };
}

/**
 * 站点地图：首页、关于页与全部项目详情页，每种语言各一条。
 * 项目 lastModified 取 frontmatter 的发布日期。
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = locales.flatMap((locale) => [
    {
      url: `${baseUrl}/${locale}/`,
      alternates: alternates("/"),
    },
    {
      url: `${baseUrl}/${locale}/about/`,
      alternates: alternates("/about/"),
    },
  ]);

  // 两语言项目集合应一致；取并集并按 slug 保留较新的日期
  const projectDates = new Map<string, string>();
  for (const locale of locales) {
    for (const project of getAllProjects(locale)) {
      const current = projectDates.get(project.slug);
      if (!current || project.date > current) {
        projectDates.set(project.slug, project.date);
      }
    }
  }

  const projectRoutes: MetadataRoute.Sitemap = [];
  for (const [slug, date] of projectDates) {
    const path = `/projects/${slug}/`;
    const lastModified = new Date(date);
    for (const locale of locales) {
      projectRoutes.push({
        url: `${baseUrl}/${locale}${path}`,
        lastModified,
        alternates: alternates(path),
      });
    }
  }

  return [...staticRoutes, ...projectRoutes];
}
