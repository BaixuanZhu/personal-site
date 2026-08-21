import Link from "next/link";
import { siteConfig } from "@/lib/config";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { NavLinks } from "@/components/shared/nav-links";
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
 * 全站吸顶头部：品牌、站内导航、语言与主题切换。
 * 品牌区固定不收缩（whitespace-nowrap + shrink-0），中文姓名在小屏隐藏，
 * 避免移动端导航条挤压导致姓名逐字竖排；导航条在小屏可横向滚动。
 * 锚点导航的滚动行为处理见 NavLinks 组件。
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
            <NavLinks locale={locale} labels={labels} />
          </nav>
          <LanguageSwitcher locale={locale} ariaLabel={labels.langSwitcher.label} />
          <ThemeToggle labels={labels.theme} />
        </div>
      </div>
    </header>
  );
}
