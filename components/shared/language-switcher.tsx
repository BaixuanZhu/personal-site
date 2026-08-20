"use client";

import { usePathname, useRouter } from "next/navigation";
import { LOCALE_COOKIE, locales, type Locale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

/** 语言切换按钮的展示文案（键为语言代码） */
const SWITCHER_LABELS: Record<Locale, string> = { zh: "中", en: "EN" };

/**
 * 写入语言偏好 Cookie，让 proxy 在后续访问无前缀路径时跳到偏好的语言。
 * （放在组件外定义，避免 react-hooks/immutability 拦截组件内对全局对象的写入。）
 *
 * @param locale 要记忆的语言
 */
function rememberLocalePreference(locale: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=31536000; samesite=lax`;
}

interface LanguageSwitcherProps {
  /** 当前语言 */
  locale: Locale;
  /** 按钮组无障碍名称（本地化文案） */
  ariaLabel: string;
}

/**
 * 中/英语言切换按钮组。
 * 切换时保留当前路径、仅替换语言前缀（如 /zh/about → /en/about），
 * 并写入 NEXT_LANG Cookie 记忆偏好（proxy 据此决定无前缀路径的跳转目标）。
 */
export function LanguageSwitcher({ locale, ariaLabel }: LanguageSwitcherProps) {
  const pathname = usePathname();
  const router = useRouter();

  /** 切换到目标语言：替换路径首段并导航 */
  const switchTo = (next: Locale) => {
    if (next === locale) return;
    rememberLocalePreference(next);
    const segments = pathname.split("/");
    segments[1] = next;
    router.push(segments.join("/") || `/${next}`);
  };

  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className="flex shrink-0 items-center rounded-lg border border-border/60 p-0.5 text-xs font-medium"
    >
      {locales.map((item) => (
        <button
          key={item}
          type="button"
          aria-pressed={locale === item}
          onClick={() => switchTo(item)}
          className={cn(
            "cursor-pointer rounded-md px-1.5 py-0.5 transition-colors",
            locale === item
              ? "bg-muted text-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {SWITCHER_LABELS[item]}
        </button>
      ))}
    </div>
  );
}
