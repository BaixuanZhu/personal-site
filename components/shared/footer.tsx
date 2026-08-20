import Link from "next/link";
import { GithubIcon, LinkedinIcon } from "@/components/shared/brand-icons";
import { siteConfig } from "@/lib/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";

interface FooterProps {
  /** 本地化文案 */
  labels: Dictionary["footer"];
}

/**
 * 全站页脚：版权信息与社交链接。
 */
export function Footer({ labels }: FooterProps) {
  return (
    <footer className="border-t border-border/60">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-muted-foreground sm:flex-row">
        <p>
          © {new Date().getFullYear()} {siteConfig.name} · {labels.rights}
        </p>
        <div className="flex items-center gap-4">
          <Link
            href={siteConfig.github}
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
            className="transition-colors hover:text-foreground"
          >
            <GithubIcon className="size-4.5" />
          </Link>
          <Link
            href={siteConfig.linkedin}
            target="_blank"
            rel="noreferrer"
            aria-label="LinkedIn"
            className="transition-colors hover:text-foreground"
          >
            <LinkedinIcon className="size-4.5" />
          </Link>
          <a
            href={`mailto:${siteConfig.email}`}
            aria-label="Email"
            className="transition-colors hover:text-foreground"
          >
            {siteConfig.email}
          </a>
        </div>
      </div>
    </footer>
  );
}
