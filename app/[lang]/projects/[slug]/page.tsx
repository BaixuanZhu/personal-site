import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { MDXRemote } from "next-mdx-remote-client/rsc";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { GithubIcon } from "@/components/shared/brand-icons";
import { defaultLocale, formatDate, isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getAllProjects, getProjectBySlug } from "@/lib/projects";
import { mdxComponents } from "@/lib/mdx-components";

type ProjectPageProps = PageProps<"/[lang]/projects/[slug]">;

/**
 * 项目详情页：头部信息（预览图/标签/成果/链接）+ MDX 正文渲染。
 * 构建期为每种语言的全部项目生成静态路由（SSG）。
 */
export default async function ProjectPage({ params }: ProjectPageProps) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();

  const [dict, project] = [
    await getDictionary(lang),
    getProjectBySlug(lang, slug),
  ];
  if (!project) notFound();

  return (
    <main className="flex-1">
      <article className="mx-auto max-w-3xl px-6 py-16 sm:py-24">
        <Link
          href={`/${lang}#projects`}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          {dict.projectPage.back}
        </Link>

        <header className="mt-8 flex flex-col gap-6">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
            <time dateTime={project.date}>{formatDate(lang, project.date)}</time>
            <span aria-hidden="true">·</span>
            <div className="flex flex-wrap gap-1.5">
              {project.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          <h1 className="font-heading text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            {project.title}
          </h1>
          <p className="text-lg leading-relaxed text-muted-foreground">
            {project.description}
          </p>

          {project.metrics.length > 0 ? (
            <div className="grid grid-cols-3 gap-4 rounded-xl border border-border/60 bg-muted/30 p-5">
              {project.metrics.map((metric) => (
                <div key={metric.label}>
                  <p className="font-heading text-2xl font-bold text-primary sm:text-3xl">
                    {metric.value}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                    {metric.label}
                  </p>
                </div>
              ))}
            </div>
          ) : null}

          {project.github || project.demo ? (
            <div className="flex flex-wrap gap-3">
              {project.github ? (
                <Button variant="outline" asChild>
                  <a href={project.github} target="_blank" rel="noreferrer">
                    <GithubIcon className="size-4" data-icon="inline-start" />
                    {dict.projectPage.github}
                  </a>
                </Button>
              ) : null}
              {project.demo ? (
                <Button variant="outline" asChild>
                  <a href={project.demo} target="_blank" rel="noreferrer">
                    {dict.projectPage.demo}
                    <ArrowUpRight data-icon="inline-end" />
                  </a>
                </Button>
              ) : null}
            </div>
          ) : null}
        </header>

        <div className="relative mt-10 aspect-[16/10] overflow-hidden rounded-xl border border-border/60">
          <Image
            src={project.image}
            alt={project.title}
            fill
            priority
            sizes="(min-width: 768px) 768px, 100vw"
            className="object-cover"
          />
        </div>

        <Separator className="my-10" />

        <div className="prose prose-neutral dark:prose-invert max-w-none prose-headings:font-heading prose-headings:tracking-tight prose-a:text-primary">
          <MDXRemote source={project.content} components={mdxComponents} />
        </div>
      </article>
    </main>
  );
}

/** 只允许构建期生成的项目路由 */
export const dynamicParams = false;

/**
 * 为每种语言的全部项目生成静态路由参数（运行时 params 只携带父级语言段）。
 */
export async function generateStaticParams(props: {
  params: { lang: string; slug: string };
}) {
  const locale = isLocale(props.params.lang) ? props.params.lang : defaultLocale;
  return getAllProjects(locale).map((project) => ({ slug: project.slug }));
}

/**
 * 按项目 frontmatter 生成页面元数据（标题/描述/OG 图/hreflang 备选链接）。
 */
export async function generateMetadata({
  params,
}: ProjectPageProps): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isLocale(lang)) return {};
  const project = getProjectBySlug(lang, slug);
  if (!project) return {};

  return {
    title: project.title,
    description: project.description,
    alternates: {
      languages: {
        zh: `/zh/projects/${slug}`,
        en: `/en/projects/${slug}`,
      },
    },
    openGraph: {
      title: project.title,
      description: project.description,
      images: [{ url: project.image }],
    },
  };
}
