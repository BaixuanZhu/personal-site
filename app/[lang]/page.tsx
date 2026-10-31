import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AboutPreview } from "@/components/sections/about-preview";
import { Contact } from "@/components/sections/contact";
import { FeaturedProjects } from "@/components/sections/featured-projects";
import { Hero } from "@/components/sections/hero";
import { Skills } from "@/components/sections/skills";
import { JsonLd } from "@/components/shared/json-ld";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getFeaturedProjects } from "@/lib/projects";
import {
  localeUrl,
  pageMetadata,
  personJsonLd,
  siteDisplayTitle,
} from "@/lib/seo";

/**
 * 首页：整合英雄区、精选项目、技术技能、关于摘要与联系区块。
 * 项目数据在构建期按语言从 content/projects/{lang}/ 读取（SSG）。
 */
export default async function HomePage({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const dict = await getDictionary(lang);
  const projects = getFeaturedProjects(lang);
  const person = personJsonLd({
    locale: lang,
    nativeName: dict.brand.nativeName,
    jobTitle: dict.metadata.role,
  });

  return (
    <>
      {/* Person 与 WebSite 各用一段 JSON-LD，便于抓取工具按 @type 识别 */}
      <JsonLd data={{ "@context": "https://schema.org", ...person }} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: siteDisplayTitle(lang, dict.brand.nativeName),
          url: localeUrl(lang),
          inLanguage: dict.htmlLang,
        }}
      />
      <main id="main" tabIndex={-1} className="flex-1">
        <Hero copy={dict.hero} />
        <FeaturedProjects
          locale={lang}
          projects={projects}
          heading={dict.featured}
          repoMeta={dict.repoMeta}
        />
        <Skills copy={dict.skills} />
        <AboutPreview locale={lang} copy={dict.aboutPreview} />
        <Contact copy={dict.contact} />
      </main>
    </>
  );
}

/**
 * 首页元数据：canonical 与分享信息由页面提供，文档标题沿用布局的 title.default。
 */
export async function generateMetadata({
  params,
}: PageProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  const siteName = siteDisplayTitle(lang, dict.brand.nativeName);

  return pageMetadata({
    locale: lang,
    path: "/",
    shareTitle: `${siteName} | ${dict.metadata.role}`,
    description: dict.metadata.description,
    ogLocale: dict.metadata.ogLocale,
    type: "website",
    nativeName: dict.brand.nativeName,
  });
}
