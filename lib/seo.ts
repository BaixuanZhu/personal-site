import type { Metadata } from "next";
import { siteConfig } from "@/lib/config";
import type { Locale } from "@/lib/i18n/config";

/**
 * 站点根地址：siteConfig.url 已包含部署子路径（如 /personal-site），
 * 统一去掉尾斜杠后再拼接，避免出现重复斜杠。
 */
const siteRoot = siteConfig.url.replace(/\/+$/, "");

/**
 * 把站内路径拼成绝对 URL。
 *
 * @param path 以 / 开头的站内路径（已是 http(s) 绝对地址时原样返回）
 * @returns 带协议与部署子路径的绝对 URL
 */
export function absoluteUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  return `${siteRoot}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * 某语言页面的绝对 URL，统一保留尾斜杠（与 trailingSlash 导出一致）。
 *
 * @param locale 目标语言
 * @param path 语言段之后的路径，如 "/"、"/about/"、"/projects/filex/"
 * @returns 页面 canonical 绝对 URL
 */
export function localeUrl(locale: Locale, path = "/"): string {
  const segment = path.replace(/^\/+|\/+$/g, "");
  return absoluteUrl(`/${locale}/${segment ? `${segment}/` : ""}`);
}

/**
 * OG/Twitter 分享图的绝对 URL。
 * 传 public/ 下的站内路径（如 "/og/home-zh.png"），部署子路径由 siteConfig.url 提供。
 *
 * @param path public/ 下的图片路径，以 / 开头
 * @returns 带协议、域名与 basePath 的绝对 URL
 */
export function ogImageUrl(path: string): string {
  return absoluteUrl(path);
}

/** 页面分享图：public/ 下的路径 + 抓取工具可读的替代文本 */
export interface PageImage {
  /** 站内路径，如 "/og/project-filex-zh.png" */
  path: string;
  /** 图片替代文本（无障碍与社交平台展示） */
  alt: string;
}

/**
 * 某页面的 hreflang 备选链接；x-default 始终指向中文版本。
 *
 * @param path 语言段之后的路径
 * @returns 以语言代码为键、绝对 URL 为值的备选链接
 */
export function alternateLanguages(path = "/"): Record<string, string> {
  const zh = localeUrl("zh", path);
  return {
    zh,
    en: localeUrl("en", path),
    "x-default": zh,
  };
}

/**
 * 页面 alternates：唯一 canonical 与 zh/en/x-default 备选链接。
 *
 * @param locale 当前页面语言
 * @param path 语言段之后的路径
 */
export function pageAlternates(
  locale: Locale,
  path = "/",
): Metadata["alternates"] {
  return {
    canonical: localeUrl(locale, path),
    languages: alternateLanguages(path),
  };
}

/**
 * 站点展示名：中文版为「朱柏轩 (Galaxy)」，英文版为「Galaxy (朱柏轩)」。
 * 字典未提供中文名时退回 siteConfig.name。
 *
 * @param locale 目标语言
 * @param nativeName 字典中的中文姓名（dict.brand.nativeName）
 */
export function siteDisplayTitle(
  locale: Locale,
  nativeName: string | null,
): string {
  if (!nativeName) return siteConfig.name;
  return locale === "zh"
    ? `${nativeName} (${siteConfig.name})`
    : `${siteConfig.name} (${nativeName})`;
}

interface PageMetadataOptions {
  /** 当前页面语言 */
  locale: Locale;
  /** 语言段之后的站内路径；首页为 "/" */
  path?: string;
  /** 页面标题（不含站点名）；省略时沿用布局的 title.default（首页） */
  title?: string;
  /** OG/Twitter 分享标题；默认由页面标题与站点展示名拼接 */
  shareTitle?: string;
  /** 页面描述 */
  description: string;
  /** Open Graph 语言标识（dict.metadata.ogLocale） */
  ogLocale: string;
  /** Open Graph 页面类型 */
  type: "website" | "article";
  /** 字典中的中文姓名（dict.brand.nativeName） */
  nativeName: string | null;
  /** OG/Twitter 分享图；省略时不输出 images（如 404 等非索引页） */
  image?: PageImage;
}

/**
 * 构造页面级 SEO 元数据：canonical、hreflang、完整 openGraph 与 twitter。
 * Next 对 metadata 做浅合并，页面必须提供完整 openGraph，避免继承其他页面的 URL。
 *
 * @param options 页面路径、标题、描述、分享图与语言信息
 * @returns 可直接合并进 generateMetadata 返回值的元数据
 */
export function pageMetadata({
  locale,
  path = "/",
  title,
  shareTitle,
  description,
  ogLocale,
  type,
  nativeName,
  image,
}: PageMetadataOptions): Metadata {
  const canonical = localeUrl(locale, path);
  const siteName = siteDisplayTitle(locale, nativeName);
  const socialTitle =
    shareTitle ?? (title ? `${title} | ${siteName}` : siteName);
  const socialImage = image ? ogImageUrl(image.path) : null;

  return {
    ...(title ? { title } : {}),
    description,
    alternates: pageAlternates(locale, path),
    openGraph: {
      title: socialTitle,
      description,
      url: canonical,
      siteName,
      locale: ogLocale,
      type,
      ...(image && socialImage
        ? {
            images: [
              {
                url: socialImage,
                width: 1200,
                height: 630,
                alt: image.alt,
                type: "image/png",
              },
            ],
          }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      ...(socialImage ? { images: [socialImage] } : {}),
    },
  };
}

/**
 * 个人结构化数据节点。首页与关于页共用，保证两处描述的是同一个 Person。
 *
 * @param locale 目标语言（决定主页 URL）
 * @param nativeName 字典中的中文姓名
 * @param jobTitle 职位头衔（dict.metadata.role）
 */
export function personJsonLd({
  locale,
  nativeName,
  jobTitle,
}: {
  locale: Locale;
  nativeName: string | null;
  jobTitle: string;
}): Record<string, unknown> {
  return {
    "@type": "Person",
    name: nativeName ?? siteConfig.name,
    alternateName: siteConfig.name,
    jobTitle,
    url: localeUrl(locale),
    sameAs: [siteConfig.github],
  };
}
