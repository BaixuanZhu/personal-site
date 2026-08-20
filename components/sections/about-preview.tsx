import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/shared/fade-in";
import { SectionHeading } from "@/components/shared/section-heading";
import { siteConfig, withBasePath } from "@/lib/config";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";

interface AboutPreviewProps {
  /** 当前语言（决定 About 页链接前缀） */
  locale: Locale;
  /** 本地化文案 */
  copy: Dictionary["aboutPreview"];
}

/**
 * 首页「关于我」摘要区块：头像 + 简短介绍，引导到完整 About 页。
 */
export function AboutPreview({ locale, copy }: AboutPreviewProps) {
  return (
    <section id="about" className="scroll-mt-20">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <div className="grid items-center gap-12 md:grid-cols-[auto_1fr]">
          <FadeIn>
            <div className="relative mx-auto size-52 sm:size-64">
              <Image
                src={withBasePath(siteConfig.avatar)}
                alt={copy.avatarAlt}
                fill
                sizes="(min-width: 768px) 16rem, 13rem"
                className="rounded-2xl border border-border/60 object-cover"
              />
            </div>
          </FadeIn>

          <FadeIn delay={0.15}>
            <SectionHeading eyebrow={copy.eyebrow} title={copy.title} />
            <div className="mt-4 space-y-4 leading-relaxed text-muted-foreground">
              {copy.paragraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 24)}>{paragraph}</p>
              ))}
            </div>
            <Button variant="link" className="mt-2 px-0" asChild>
              <Link href={`/${locale}/about`}>
                {copy.more}
                <ArrowRight data-icon="inline-end" />
              </Link>
            </Button>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
