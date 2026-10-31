import "./globals.css";
import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { siteConfig, withBasePath } from "@/lib/config";
import { zh } from "@/lib/i18n/dictionaries/zh";

/**
 * 全局 404 页：捕获所有未匹配路由（含非法语言前缀）。
 * global-not-found 独立于 [lang] 布局渲染（不经过 ThemeProvider/字体变量），
 * 因此这里自行引入 globals.css、用内联脚本恢复主题，并采用中英双语展示。
 */

/** 中文姓名以字典为唯一数据源；缺失时退回英文名 */
const displayName = zh.brand.nativeName
  ? `${zh.brand.nativeName} (${siteConfig.name})`
  : siteConfig.name;

/**
 * 主题初始化脚本（必须是 <body> 的第一个元素，先于首次绘制执行）。
 * 与站点 ThemeProvider 对齐：读取 next-themes 的 localStorage 键 `theme`
 * （light / dark / system），未存储或 system 时跟随 prefers-color-scheme，
 * 同步切换 <html> 的 dark 类与 style.colorScheme，避免亮暗闪烁。
 * localStorage 在隐私模式等场景可能抛错，故整体包裹 try/catch。
 */
const themeInitScript = `(function(){try{var t=localStorage.getItem("theme");var dark=t==="dark"||(t!=="light"&&window.matchMedia("(prefers-color-scheme: dark)").matches);var root=document.documentElement;root.classList.toggle("dark",dark);root.style.colorScheme=dark?"dark":"light";}catch(e){}})();`;

/**
 * 404 的 SEO 元数据：标题同时包含 404 与中英文站点名。
 * Next 会为 404 自动注入 noindex，故这里不再重复声明 robots。
 */
export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  icons: {
    icon: withBasePath("/favicon.ico"),
  },
  title: `404 · 页面不存在 | ${displayName}`,
  description:
    "页面不存在：地址可能有误，或该内容已被移动、尚未发布。 Page not found: the address may be incorrect, or the page has moved or is not published yet.",
};

/** 浏览器 UI 主题色跟随亮暗模式（与 [lang] 布局保持一致） */
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  colorScheme: "light dark",
};

export default function GlobalNotFound() {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="min-h-dvh antialiased">
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <div className="relative flex min-h-dvh flex-col overflow-hidden">
          {/* 背景装饰：复用首页英雄区的径向光晕，跟随主题令牌 */}
          <div
            aria-hidden="true"
            className="hero-glow pointer-events-none absolute inset-x-0 top-0 -z-10 h-96"
          />

          <header className="mx-auto flex w-full max-w-6xl items-center px-5 py-4 sm:px-6">
            <Link
              href="/zh/"
              className="inline-flex min-h-11 items-center gap-1.5 font-heading text-base font-semibold tracking-tight"
            >
              {siteConfig.name}
              {zh.brand.nativeName ? (
                <span className="font-normal text-muted-foreground">
                  · {zh.brand.nativeName}
                </span>
              ) : null}
            </Link>
          </header>

          <main
            id="main"
            className="flex flex-1 items-center justify-center px-5 pb-16 sm:px-6"
          >
            <section
              aria-labelledby="not-found-title"
              className="w-full max-w-xl rounded-2xl border border-border bg-card p-6 text-center shadow-sm sm:p-10"
            >
              <p className="font-heading text-7xl leading-none font-bold tracking-tighter text-foreground sm:text-8xl">
                404
              </p>

              <h1
                id="not-found-title"
                className="mt-6 font-heading text-2xl font-semibold tracking-tight text-balance sm:text-3xl"
              >
                页面不存在
                <span
                  lang="en"
                  className="mt-1 block text-lg font-medium text-muted-foreground sm:text-xl"
                >
                  Page not found
                </span>
              </h1>

              <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
                地址可能有误，或该内容已被移动、尚未发布。
                <span lang="en" className="mt-2 block">
                  The address may be incorrect, or the page has moved or is not
                  published yet.
                </span>
              </p>

              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Button size="lg" className="h-11 px-5" asChild>
                  <Link href="/zh/">
                    <Home data-icon="inline-start" aria-hidden="true" />
                    返回中文首页
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-11 px-5"
                  asChild
                >
                  <Link href="/en/">
                    <ArrowLeft data-icon="inline-start" aria-hidden="true" />
                    <span lang="en">Back to English home</span>
                  </Link>
                </Button>
              </div>
            </section>
          </main>
        </div>
      </body>
    </html>
  );
}
