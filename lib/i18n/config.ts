/**
 * 多语言基础配置：语言清单、类型收窄与日期本地化工具。
 * 本文件保持零服务端依赖，可同时被服务器组件与客户端组件引用。
 */

/** 站点支持的语言 */
export const locales = ["zh", "en"] as const;

/** 站点语言类型 */
export type Locale = (typeof locales)[number];

/** 默认语言（无任何偏好信息时使用） */
export const defaultLocale: Locale = "zh";

/** 语言偏好 Cookie 名（语言切换器写入、proxy 读取） */
export const LOCALE_COOKIE = "NEXT_LANG";

/**
 * 判断给定字符串是否为站点支持的语言。
 *
 * @param value 待检查的字符串（通常来自路由参数）
 * @returns 是站点支持的语言时返回 true
 */
export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

/**
 * 按语言格式化 ISO 日期（如 2026-05-12 → 2026年5月12日 / May 12, 2026）。
 *
 * @param locale 目标语言
 * @param isoDate ISO 格式日期字符串
 * @returns 本地化日期文案
 */
export function formatDate(locale: Locale, isoDate: string): string {
  return new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(isoDate));
}
