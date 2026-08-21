"use client";

import { motion } from "motion/react";
import type { Transition } from "motion/react";
import { Mail, MessageCircle } from "lucide-react";
import type { ReactNode } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { GithubIcon } from "@/components/shared/brand-icons";
import { useAllowMotion } from "@/components/shared/use-allow-motion";
import { siteConfig, withBasePath } from "@/lib/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";

/** 入场动效公共参数：淡入 + 轻微上浮，按序错落 */
const riseItem = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

/** Rise 支持的标签集（Hero 入场元素用到的） */
type RiseTag = "span" | "h1" | "p" | "div";

interface RiseProps {
  /** 渲染的 HTML 标签 */
  as: RiseTag;
  /** 是否启用 motion 入场（SSR / hydration 首帧 / 减少动态设备为 false） */
  animated: boolean;
  /** motion 过渡参数（仅 animated 时生效） */
  transition?: Transition;
  className?: string;
  children: ReactNode;
}

/**
 * Hero 入场元素包装：启用动画时挂 riseItem variants 交给父级 stagger 编排，
 * 否则渲染纯静态标签，保证 SSR 与客户端首帧输出一致。
 */
function Rise({ as, animated, transition, className, children }: RiseProps) {
  if (!animated) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }
  const MotionTag = motion[as];
  return (
    <MotionTag variants={riseItem} transition={transition} className={className}>
      {children}
    </MotionTag>
  );
}

interface HeroProps {
  /** 本地化文案 */
  copy: Dictionary["hero"];
}

/**
 * 首页英雄区：核心价值主张、头像与行动入口。
 * 文案来自语言字典，社交与 BOSS直聘链接来自 lib/config.ts；
 * 入场动画仅在挂载后且系统未开启"减少动态效果"时启用（useAllowMotion）。
 */
export function Hero({ copy }: HeroProps) {
  const allowMotion = useAllowMotion();
  const fade = { duration: 0.5 } satisfies Transition;

  const heroContent = (
    <>
      <Rise as="span" animated={allowMotion} transition={fade} className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/50 px-3 py-1 text-sm text-muted-foreground">
        <span className="size-2 rounded-full bg-emerald-500" />
        {copy.available}
      </Rise>

      <Rise as="h1" animated={allowMotion} transition={fade} className="font-heading text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl">
        {copy.tagline}
      </Rise>

      <Rise as="p" animated={allowMotion} transition={fade} className="max-w-xl text-lg leading-relaxed text-muted-foreground">
        {copy.intro}
      </Rise>

      <Rise as="div" animated={allowMotion} transition={fade} className="flex flex-wrap items-center gap-3">
        <Button size="lg" asChild>
          <a href={siteConfig.boss} target="_blank" rel="noreferrer">
            <MessageCircle data-icon="inline-start" />
            {copy.ctaBoss}
          </a>
        </Button>
      </Rise>

      <Rise as="div" animated={allowMotion} transition={fade} className="mt-2 flex items-center gap-4 text-muted-foreground">
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
      </Rise>
    </>
  );

  const avatarBlock = (
    <div className="rounded-full bg-gradient-to-br from-indigo-400/60 via-sky-400/40 to-emerald-400/60 p-1.5">
      <Avatar className="size-36 border-2 border-background sm:size-44">
        <AvatarImage src={withBasePath(siteConfig.avatar)} alt={copy.avatarAlt} />
        <AvatarFallback>
          {siteConfig.name
            .split(" ")
            .map((part) => part[0])
            .join("")}
        </AvatarFallback>
      </Avatar>
    </div>
  );

  return (
    <section className="relative overflow-hidden">
      {/* 背景装饰：径向光晕 */}
      <div aria-hidden="true" className="hero-glow pointer-events-none absolute inset-0 -z-10" />

      <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-24 sm:py-32 md:grid-cols-[1fr_auto]">
        {allowMotion ? (
          <motion.div
            variants={{ show: { transition: { staggerChildren: 0.12 } } }}
            initial="hidden"
            animate="show"
            className="flex flex-col items-start gap-6"
          >
            {heroContent}
          </motion.div>
        ) : (
          <div className="flex flex-col items-start gap-6">{heroContent}</div>
        )}

        {allowMotion ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
            className="justify-self-center"
          >
            {avatarBlock}
          </motion.div>
        ) : (
          <div className="justify-self-center">{avatarBlock}</div>
        )}
      </div>
    </section>
  );
}
