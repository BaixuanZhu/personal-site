import type { Metadata } from "next";
import { Geist_Mono, Inter, Noto_Sans_SC } from "next/font/google";
import { notFound } from "next/navigation";
import { ThemeProvider } from "@/components/theme-provider";
import { Footer } from "@/components/shared/footer";
import { Header } from "@/components/shared/header";
import { siteConfig } from "@/lib/config";
import { defaultLocale, isLocale, locales } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import "../globals.css";

const fontInter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const fontNotoSansSC = Noto_Sans_SC({
  subsets: ["latin"],
  variable: "--font-noto-sans-sc",
  display: "swap",
});

const fontGeistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

/** 只允许构建期生成的语言路由，未知的语言前缀直接 404 */
export const dynamicParams = false;

/**
 * 多语言根布局：<html lang> 随语言变化，Header/Footer 文案由字典注入。
 * 全部页面在构建期按语言静态生成（SSG）。
 */
export default async function RootLayout({
  children,
  params,
}: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  return (
    <html
      lang={dict.htmlLang}
      suppressHydrationWarning
      className={`${fontInter.variable} ${fontNotoSansSC.variable} ${fontGeistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Header
            locale={lang}
            labels={{
              brand: dict.brand,
              nav: dict.nav,
              theme: dict.theme,
              langSwitcher: dict.langSwitcher,
            }}
          />
          {children}
          <Footer labels={dict.footer} />
        </ThemeProvider>
      </body>
    </html>
  );
}

/**
 * 为两种语言生成静态布局参数。
 */
export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

/**
 * 按语言生成 SEO 元数据（标题/描述/OG/hreflang 备选链接）。
 */
export async function generateMetadata({
  params,
}: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  const locale = isLocale(lang) ? lang : defaultLocale;
  const dict = await getDictionary(locale);
  const title = `${siteConfig.name} | ${dict.metadata.role}`;

  return {
    metadataBase: new URL(siteConfig.url),
    title: {
      default: title,
      template: `%s | ${siteConfig.name}`,
    },
    description: dict.metadata.description,
    alternates: {
      languages: { zh: "/zh", en: "/en" },
    },
    openGraph: {
      title,
      description: dict.metadata.description,
      url: siteConfig.url,
      siteName: siteConfig.name,
      locale: dict.metadata.ogLocale,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: dict.metadata.description,
    },
  };
}
