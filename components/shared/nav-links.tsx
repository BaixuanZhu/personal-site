"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { basePath, navItems } from "@/lib/config";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";

interface NavLinksProps {
  /** 当前语言（决定导航链接前缀） */
  locale: Locale;
  /** 本地化文案（nav 字段） */
  labels: Pick<Dictionary, "nav">;
}

/**
 * 为导航地址拼接语言前缀。
 * 锚点路由（/#projects）合并为 /zh#projects，普通路由（/about）拼为 /zh/about。
 *
 * @param locale 当前语言
 * @param href 配置中的原始地址（以 / 开头）
 * @returns 带语言前缀的地址
 */
function localizedHref(locale: Locale, href: string): string {
  return href.startsWith("/#")
    ? `/${locale}${href.slice(1)}`
    : `/${locale}${href}`;
}

/** 导航链接公共样式（由 Header 全部导航项共享） */
const linkClassName =
  "rounded-md px-2.5 py-1.5 whitespace-nowrap text-muted-foreground transition-colors hover:bg-muted hover:text-foreground";

/**
 * 顶部导航链接列表。
 * 首页内的锚点项渲染为原生 `<a href="#...">`：App Router 下 next/link
 * 对同一路由仅追加 hash 时不触发滚动（点击无反应），原生锚点由浏览器
 * 直接处理平滑滚动更可靠；非首页仍走 next/link 跨页跳转后定位。
 */
export function NavLinks({ locale, labels }: NavLinksProps) {
  const pathname = usePathname().replace(
    new RegExp(`^${basePath}/?`),
    "/",
  );
  const isHome = pathname === `/${locale}` || pathname === `/${locale}/`;

  return (
    <>
      {navItems.map((item) =>
        isHome && item.href.startsWith("/#") ? (
          <a key={item.key} href={item.href.slice(1)} className={linkClassName}>
            {labels.nav[item.key]}
          </a>
        ) : (
          <Link
            key={item.key}
            href={localizedHref(locale, item.href)}
            className={linkClassName}
          >
            {labels.nav[item.key]}
          </Link>
        ),
      )}
    </>
  );
}
