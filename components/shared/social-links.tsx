import { Mail } from "lucide-react";
import type { ComponentType, SVGProps } from "react";
import { CsdnIcon, GithubIcon, PixivIcon } from "@/components/shared/brand-icons";
import { socialLinks } from "@/lib/config";
import { cn } from "@/lib/utils";

/** 入口 id 到图标组件的映射（邮箱复用 lucide 的 Mail 图标） */
const iconMap: Record<string, ComponentType<SVGProps<SVGSVGElement>>> = {
  github: GithubIcon,
  pixiv: PixivIcon,
  csdn: CsdnIcon,
  email: Mail,
};

interface SocialLinksProps {
  /** 尺寸档位：md 用于 Hero 与联系区（11rem 圆形），sm 用于页脚（9rem） */
  size?: "md" | "sm";
}

/**
 * 全站社交入口行：带边框与悬浮态的圆形图标按钮，
 * 比裸图标更醒目。http(s) 外链新标签页打开，mailto 保持当前页。
 */
export function SocialLinks({ size = "md" }: SocialLinksProps) {
  const md = size === "md";
  return (
    <div className={cn("flex items-center", md ? "gap-3" : "gap-2.5")}>
      {socialLinks.map((link) => {
        const Icon = iconMap[link.id];
        const external = link.href.startsWith("http");
        return (
          <a
            key={link.id}
            href={link.href}
            {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
            aria-label={link.label}
            title={link.label}
            className={cn(
              "flex items-center justify-center rounded-full border border-border/60 bg-muted/40 text-muted-foreground transition-colors hover:border-foreground/30 hover:bg-accent hover:text-foreground",
              md ? "size-11" : "size-9"
            )}
          >
            <Icon className={md ? "size-5" : "size-4"} />
          </a>
        );
      })}
    </div>
  );
}
