import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Locale } from "@/lib/i18n/config";
import type { Project } from "@/lib/projects";

interface ProjectCardProps {
  /** 要展示的项目数据 */
  project: Project;
  /** 当前语言（决定详情页链接前缀） */
  locale: Locale;
  /** 优先加载首屏卡片图片 */
  priority?: boolean;
}

/**
 * 精选项目卡片：预览图、技术标签、量化成果与详情页入口。
 */
export function ProjectCard({ project, locale, priority = false }: ProjectCardProps) {
  return (
    <Link
      href={`/${locale}/projects/${project.slug}`}
      className="group block h-full"
    >
      <Card className="h-full transition-all duration-300 group-hover:-translate-y-1 group-hover:ring-primary/30">
        <div className="relative aspect-[16/10] overflow-hidden">
          <Image
            src={project.image}
            alt={project.title}
            fill
            priority={priority}
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        </div>

        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-lg">{project.title}</CardTitle>
            <ArrowUpRight className="mt-1 size-4 shrink-0 text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground" />
          </div>
          <CardDescription className="line-clamp-2">
            {project.description}
          </CardDescription>
        </CardHeader>

        <CardContent className="mt-auto flex flex-col gap-4">
          {project.metrics.length > 0 ? (
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              {project.metrics.map((metric) => (
                <div key={metric.label}>
                  <p className="font-heading text-lg font-semibold text-primary">
                    {metric.value}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {metric.label}
                  </p>
                </div>
              ))}
            </div>
          ) : null}

          <div className="flex flex-wrap gap-1.5">
            {project.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
