import type { LucideIcon } from "lucide-react";
import { Bot, Code2, Server } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { FadeIn } from "@/components/shared/fade-in";
import { SectionHeading } from "@/components/shared/section-heading";
import type { Dictionary } from "@/lib/i18n/dictionaries";

/** 技能分类 id → 图标组件映射（文案与技能清单来自语言字典） */
const CATEGORY_ICONS: Record<string, LucideIcon> = {
  backend: Server,
  frontend: Code2,
  ai: Bot,
};

interface SkillsProps {
  /** 本地化文案（含分类数据） */
  copy: Dictionary["skills"];
}

/**
 * 首页「技术技能」区块：按分类展示技能标签，帮助快速捕捉技术广度。
 */
export function Skills({ copy }: SkillsProps) {
  return (
    <section id="skills" className="scroll-mt-20 border-y border-border/60 bg-muted/30">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <FadeIn>
          <SectionHeading
            eyebrow={copy.eyebrow}
            title={copy.title}
            description={copy.description}
          />
        </FadeIn>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {copy.categories.map((category, index) => {
            const Icon = CATEGORY_ICONS[category.id] ?? Code2;
            return (
              <FadeIn key={category.id} delay={index * 0.1} className="h-full">
                <div className="flex h-full flex-col gap-4 rounded-xl border border-border/60 bg-card p-6">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="size-5" />
                    </div>
                    <div>
                      <h3 className="font-heading font-semibold">
                        {category.title}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {category.hint}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {category.skills.map((skill) => (
                      <Badge key={skill} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </section>
  );
}
