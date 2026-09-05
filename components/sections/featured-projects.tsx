import { FadeIn } from "@/components/shared/fade-in";
import { ProjectCard } from "@/components/shared/project-card";
import { SectionHeading } from "@/components/shared/section-heading";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { Project } from "@/lib/projects";

interface FeaturedProjectsProps {
  /** 当前语言（决定详情页链接前缀） */
  locale: Locale;
  /** 首页展示的精选项目列表（来自 lib/projects.ts） */
  projects: Project[];
  /** 区块标题文案 */
  heading: Dictionary["featured"];
  /** 仓库实时元信息文案（透传给项目卡片） */
  repoMeta: Dictionary["repoMeta"];
}

/**
 * 首页「精选项目」区块：网格展示各项目卡片，滚动进入时错落入场。
 */
export function FeaturedProjects({ locale, projects, heading, repoMeta }: FeaturedProjectsProps) {
  return (
    <section id="projects" className="scroll-mt-20">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <FadeIn>
          <SectionHeading
            eyebrow={heading.eyebrow}
            title={heading.title}
            description={heading.description}
          />
        </FadeIn>

        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {projects.map((project, index) => (
            <FadeIn key={project.slug} delay={index * 0.1} className="h-full">
              <ProjectCard
                project={project}
                locale={locale}
                repoMeta={repoMeta}
                priority={index === 0}
              />
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
