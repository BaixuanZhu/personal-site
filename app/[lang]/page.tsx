import { notFound } from "next/navigation";
import { AboutPreview } from "@/components/sections/about-preview";
import { Contact } from "@/components/sections/contact";
import { FeaturedProjects } from "@/components/sections/featured-projects";
import { Hero } from "@/components/sections/hero";
import { Skills } from "@/components/sections/skills";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getFeaturedProjects } from "@/lib/projects";

/**
 * 首页：整合英雄区、精选项目、技术技能、关于摘要与联系区块。
 * 项目数据在构建期按语言从 content/projects/{lang}/ 读取（SSG）。
 */
export default async function HomePage({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const dict = await getDictionary(lang);
  const projects = getFeaturedProjects(lang);

  return (
    <main className="flex-1">
      <Hero locale={lang} copy={dict.hero} />
      <FeaturedProjects
        locale={lang}
        projects={projects}
        heading={dict.featured}
      />
      <Skills copy={dict.skills} />
      <AboutPreview locale={lang} copy={dict.aboutPreview} />
      <Contact copy={dict.contact} />
    </main>
  );
}
