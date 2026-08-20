"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { ArrowRight, Download, Mail } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { GithubIcon } from "@/components/shared/brand-icons";
import { siteConfig } from "@/lib/config";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";

/** 入场动效公共参数：淡入 + 轻微上浮，按序错落 */
const riseItem = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

interface HeroProps {
  /** 当前语言（决定站内链接前缀） */
  locale: Locale;
  /** 本地化文案 */
  copy: Dictionary["hero"];
}

/**
 * 首页英雄区：核心价值主张、头像与行动入口。
 * 文案来自语言字典，社交与简历链接来自 lib/config.ts。
 */
export function Hero({ locale, copy }: HeroProps) {
  return (
    <section className="relative overflow-hidden">
      {/* 背景装饰：径向光晕 */}
      <div aria-hidden="true" className="hero-glow pointer-events-none absolute inset-0 -z-10" />

      <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-24 sm:py-32 md:grid-cols-[1fr_auto]">
        <motion.div
          variants={{ show: { transition: { staggerChildren: 0.12 } } }}
          initial="hidden"
          animate="show"
          className="flex flex-col items-start gap-6"
        >
          <motion.span
            variants={riseItem}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/50 px-3 py-1 text-sm text-muted-foreground"
          >
            <span className="size-2 rounded-full bg-emerald-500" />
            {copy.available}
          </motion.span>

          <motion.h1
            variants={riseItem}
            transition={{ duration: 0.5 }}
            className="font-heading text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl"
          >
            {copy.tagline}
          </motion.h1>

          <motion.p
            variants={riseItem}
            transition={{ duration: 0.5 }}
            className="max-w-xl text-lg leading-relaxed text-muted-foreground"
          >
            {copy.intro}
          </motion.p>

          <motion.div
            variants={riseItem}
            transition={{ duration: 0.5 }}
            className="flex flex-wrap items-center gap-3"
          >
            <Button size="lg" asChild>
              <Link href={`/${locale}#projects`}>
                {copy.ctaProjects}
                <ArrowRight data-icon="inline-end" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <a href={siteConfig.resume} download>
                <Download data-icon="inline-start" />
                {copy.ctaResume}
              </a>
            </Button>
          </motion.div>

          <motion.div
            variants={riseItem}
            transition={{ duration: 0.5 }}
            className="mt-2 flex items-center gap-4 text-muted-foreground"
          >
            <a
              href={siteConfig.github}
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub"
              className="transition-colors hover:text-foreground"
            >
              <GithubIcon className="size-5" />
            </a>
            <a
              href={`mailto:${siteConfig.email}`}
              aria-label="Email"
              className="transition-colors hover:text-foreground"
            >
              <Mail className="size-5" />
            </a>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
          className="justify-self-center"
        >
          <div className="rounded-full bg-gradient-to-br from-indigo-400/60 via-sky-400/40 to-emerald-400/60 p-1.5">
            <Avatar className="size-36 border-2 border-background sm:size-44">
              <AvatarImage src={siteConfig.avatar} alt={copy.avatarAlt} />
              <AvatarFallback>
                {siteConfig.name
                  .split(" ")
                  .map((part) => part[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
