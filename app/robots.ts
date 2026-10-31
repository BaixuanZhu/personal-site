import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/config";

// 静态导出要求 metadata 路由显式声明为静态
export const dynamic = "force-static";

// siteConfig.url 已包含部署子路径（如 /personal-site），此处不再拼 basePath
const baseUrl = siteConfig.url.replace(/\/+$/, "");

/** robots.txt：允许全站抓取，并指向绝对地址的 sitemap */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
