import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { FadeIn } from "@/components/shared/fade-in";
import { JsonLd } from "@/components/shared/json-ld";
import { ProjectCard } from "@/components/shared/project-card";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getAllProjects } from "@/lib/projects";
import { localeUrl, pageMetadata, siteDisplayTitle } from "@/lib/seo";

type ProjectsIndexPageProps = PageProps<"/[lang]/projects">;

/**
 * 项目索引页：列出当前语言的全部开源项目（按发布日期倒序）。
 * 首页只展示 4 个精选，这里保证其余项目同样可达。
 */
export default async function ProjectsIndexPage({
  params,
}: ProjectsIndexPageProps) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const dict = await getDictionary(lang);
  const projects = getAllProjects(lang);
  const copy = dict.projectsIndex;

  return (
    <main id="main" tabIndex={-1} className="flex-1">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          url: localeUrl(lang, "/projects/"),
          name: copy.title,
          description: copy.description,
          inLanguage: dict.htmlLang,
          mainEntity: {
            "@type": "ItemList",
            numberOfItems: projects.length,
            itemListElement: projects.map((project, index) => ({
              "@type": "ListItem",
              position: index + 1,
              name: project.title,
              url: localeUrl(lang, `/projects/${project.slug}/`),
            })),
          },
        }}
      />

      <section className="mx-auto max-w-6xl px-6 py-16 sm:py-24">
        <FadeIn>
          <div className="max-w-2xl">
            <Link
              href={`/${lang}`}
              className="inline-flex min-h-11 items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="size-4" />
              {copy.backHome}
            </Link>
            <p className="mt-6 text-sm font-medium tracking-widest text-muted-foreground uppercase">
              {copy.eyebrow}
            </p>
            <h1 className="mt-2 font-heading text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
              {copy.title}
            </h1>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              {copy.description}
            </p>
          </div>
        </FadeIn>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, index) => (
            <FadeIn key={project.slug} delay={index * 0.06} className="h-full">
              <ProjectCard
                project={project}
                locale={lang}
                repoMeta={dict.repoMeta}
                priority={index < 2}
              />
            </FadeIn>
          ))}
        </div>
      </section>
    </main>
  );
}

/** 索引页元数据：canonical、hreflang、分享图与索引页标题。 */
export async function generateMetadata({
  params,
}: ProjectsIndexPageProps): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  const siteName = siteDisplayTitle(lang, dict.brand.nativeName);

  return pageMetadata({
    locale: lang,
    path: "/projects/",
    title: dict.projectsIndex.title,
    description: dict.projectsIndex.description,
    ogLocale: dict.metadata.ogLocale,
    type: "website",
    nativeName: dict.brand.nativeName,
    image: {
      path: `/og/projects-${lang}.png`,
      alt: `${dict.projectsIndex.title} — ${siteName}`,
    },
  });
}
