import { Mail, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { GithubIcon } from "@/components/shared/brand-icons";
import { FadeIn } from "@/components/shared/fade-in";
import { siteConfig } from "@/lib/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";

interface ContactProps {
  /** 本地化文案 */
  copy: Dictionary["contact"];
}

/**
 * 首页「联系与行动」区块：BOSS直聘名片引流与社交入口，促成下一步沟通。
 */
export function Contact({ copy }: ContactProps) {
  return (
    <section id="contact" className="scroll-mt-20 border-t border-border/60">
      <div className="mx-auto max-w-6xl px-6 py-24 text-center sm:py-32">
        <FadeIn>
          <p className="text-sm font-medium tracking-widest text-muted-foreground uppercase">
            {copy.eyebrow}
          </p>
          <h2 className="mx-auto mt-3 max-w-2xl font-heading text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            {copy.title}
          </h2>
          <p className="mx-auto mt-4 max-w-xl leading-relaxed text-muted-foreground">
            {copy.description}
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button size="lg" asChild>
              <a href={siteConfig.boss} target="_blank" rel="noreferrer">
                <MessageCircle data-icon="inline-start" />
                {copy.boss}
              </a>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <a href={`mailto:${siteConfig.email}`}>
                <Mail data-icon="inline-start" />
                {copy.email}
              </a>
            </Button>
          </div>

          <Separator className="mx-auto mt-10 max-w-xs" />

          <div className="mt-6 flex items-center justify-center gap-5 text-muted-foreground">
            <a
              href={siteConfig.github}
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub"
              className="transition-colors hover:text-foreground"
            >
              <GithubIcon className="size-5" />
            </a>
            <span className="text-sm">{siteConfig.email}</span>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
