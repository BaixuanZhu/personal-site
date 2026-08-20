import Link from "next/link";
import { navItems, siteConfig } from "@/lib/config";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { ThemeToggle } from "@/components/shared/theme-toggle";

/** Header 需要的本地化文案（由 [lang] 布局从字典注入） */
type HeaderLabels = Pick<Dictionary, "brand" | "nav" | "theme" | "langSwitcher">;

interface HeaderProps {
  /** 当前语言（决定导航链接前缀） */
  locale: Locale;
  /** 本地化文案 */
  labels: HeaderLabels;
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

/**
 * 全站吸顶头部：品牌、站内导航、语言与主题切换。
 * 品牌区固定不收缩（whitespace-nowrap + shrink-0），中文姓名在小屏隐藏，
 * 避免移动端导航条挤压导致姓名逐字竖排；导航条在小屏可横向滚动。
 */
export function Header({ locale, labels }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:gap-4 sm:px-6">
        <Link
          href={`/${locale}`}
          className="shrink-0 whitespace-nowrap font-heading text-base font-semibold tracking-tight"
        >
          {siteConfig.name}
          {labels.brand.nativeName ? (
            <span className="hidden font-normal text-muted-foreground sm:inline">
              {" "}
              · {labels.brand.nativeName}
            </span>
          ) : null}
        </Link>

        <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
          <nav className="flex min-w-0 items-center gap-1 overflow-x-auto text-sm [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {navItems.map((item) => (
              <Link
                key={item.key}
                href={localizedHref(locale, item.href)}
                className="rounded-md px-2.5 py-1.5 whitespace-nowrap text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {labels.nav[item.key]}
              </Link>
            ))}
          </nav>
          <LanguageSwitcher locale={locale} ariaLabel={labels.langSwitcher.label} />
          <ThemeToggle labels={labels.theme} />
        </div>
      </div>
    </header>
  );
}
