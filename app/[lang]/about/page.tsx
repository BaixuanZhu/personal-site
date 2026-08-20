import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowRight, Briefcase, Coffee, MapPin, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/shared/fade-in";
import { SectionHeading } from "@/components/shared/section-heading";
import { siteConfig } from "@/lib/config";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";

type AboutPageProps = PageProps<"/[lang]/about">;

/**
 * 「关于我」完整页：个人介绍、职业经历时间线、工作方式与兴趣爱好。
 * 文案全部来自语言字典，构建期按语言静态生成。
 */
export default async function AboutPage({ params }: AboutPageProps) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const dict = await getDictionary(lang);
  const { about } = dict;

  return (
    <main className="flex-1">
      {/* 个人介绍 */}
      <section className="mx-auto max-w-6xl px-6 pt-20 pb-16 sm:pt-28">
        <FadeIn>
          <div className="grid items-center gap-10 md:grid-cols-[auto_1fr]">
            <div className="relative mx-auto size-40 sm:size-48">
              <Image
                src={siteConfig.avatar}
                alt={dict.aboutPreview.avatarAlt}
                fill
                priority
                sizes="(min-width: 768px) 12rem, 10rem"
                className="rounded-2xl border border-border/60 object-cover"
              />
            </div>
            <div>
              <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
                {siteConfig.name}
                {dict.brand.nativeName ? (
                  <span className="font-normal text-muted-foreground">
                    {" "}
                    {dict.brand.nativeName}
                  </span>
                ) : null}
              </h1>
              <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <Briefcase className="size-4" />
                  {dict.metadata.role}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="size-4" />
                  {about.location}
                </span>
              </p>
              <div className="mt-5 space-y-4 leading-relaxed text-muted-foreground">
                {about.paragraphs.map((paragraph) => (
                  <p key={paragraph.slice(0, 24)}>{paragraph}</p>
                ))}
              </div>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* 职业经历 */}
      <section className="border-y border-border/60 bg-muted/30">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <FadeIn>
            <SectionHeading
              eyebrow={about.journey.eyebrow}
              title={about.journey.title}
            />
          </FadeIn>
          <div className="mt-10 max-w-3xl space-y-8">
            {about.journey.items.map((item, index) => (
              <FadeIn key={item.period} delay={index * 0.08}>
                <div className="relative border-l border-border pl-6">
                  <span className="absolute top-1.5 -left-[5px] size-2.5 rounded-full bg-primary ring-4 ring-primary/15" />
                  <p className="text-sm font-medium text-muted-foreground">
                    {item.period}
                  </p>
                  <h3 className="mt-1 font-heading font-semibold">
                    {item.role}
                  </h3>
                  <p className="mt-2 leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* 工作方式 */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <FadeIn>
          <SectionHeading
            eyebrow={about.principles.eyebrow}
            title={about.principles.title}
          />
        </FadeIn>
        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {about.principles.items.map((item, index) => (
            <FadeIn key={item.title} delay={index * 0.06} className="h-full">
              <div className="h-full rounded-xl border border-border/60 bg-card p-6">
                <h3 className="flex items-center gap-2 font-heading font-semibold">
                  <Sparkles className="size-4 text-primary" />
                  {item.title}
                </h3>
                <p className="mt-2 leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* 兴趣与下一步 */}
      <section className="border-t border-border/60">
        <div className="mx-auto max-w-6xl px-6 py-20 text-center">
          <FadeIn>
            <p className="inline-flex items-center gap-2 text-sm font-medium tracking-widest text-muted-foreground uppercase">
              <Coffee className="size-4" />
              {about.offClock.eyebrow}
            </p>
            <h2 className="mx-auto mt-3 max-w-xl font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
              {about.offClock.title}
            </h2>
            <p className="mx-auto mt-4 max-w-xl leading-relaxed text-muted-foreground">
              {about.offClock.description}
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button asChild>
                <Link href={`/${lang}#contact`}>
                  {about.offClock.ctaContact}
                  <ArrowRight data-icon="inline-end" />
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href={`/${lang}#projects`}>
                  {about.offClock.ctaProjects}
                </Link>
              </Button>
            </div>
          </FadeIn>
        </div>
      </section>
    </main>
  );
}

/**
 * 按语言生成 About 页元数据。
 */
export async function generateMetadata({
  params,
}: AboutPageProps): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);

  return {
    title: dict.about.metadataTitle,
    description: dict.metadata.description,
  };
}
