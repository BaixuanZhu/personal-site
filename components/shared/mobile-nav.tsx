"use client";

import { Menu, X } from "lucide-react";
import { Dialog } from "radix-ui";
import { useState } from "react";
import { NavLinks } from "@/components/shared/nav-links";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";

/** 抽屉需要的本地化文案：导航项 + 菜单开关的无障碍名称 */
type MobileNavLabels = Pick<Dictionary, "nav" | "mobileNav">;

interface MobileNavProps {
  /** 当前语言（决定导航链接前缀） */
  locale: Locale;
  /** 本地化文案（由 Header 从字典注入） */
  labels: MobileNavLabels;
}

/** 抽屉内导航项样式：整行可点，触控目标 ≥44px */
const drawerLinkClassName =
  "flex min-h-11 items-center rounded-lg px-3 text-base whitespace-nowrap text-muted-foreground transition-colors hover:bg-muted hover:text-foreground";

/**
 * 移动端导航抽屉（md 以下显示，桌面端隐藏）。
 * 基于 Radix Dialog：焦点陷阱、ESC 关闭、滚动锁定、遮罩点击关闭与
 * 关闭后焦点返回触发按钮均由 Radix 提供；点击导航项后主动关闭抽屉。
 * 语言与主题切换保留在 Header 中，不在抽屉内重复。
 */
export function MobileNav({ locale, labels }: MobileNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button
          variant="ghost"
          size="icon-lg"
          className="md:hidden"
          aria-label={labels.mobileNav.open}
        >
          <Menu />
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed inset-y-0 right-0 z-50 flex h-full w-72 max-w-[85vw] flex-col overflow-y-auto border-l border-border bg-background p-6 shadow-2xl data-[state=open]:animate-in data-[state=open]:slide-in-from-right data-[state=open]:duration-200"
        >
          <div className="flex items-center justify-between gap-3">
            <Dialog.Title className="font-heading text-base font-semibold tracking-tight">
              {labels.mobileNav.label}
            </Dialog.Title>
            <Dialog.Close asChild>
              <Button
                variant="ghost"
                size="icon-lg"
                aria-label={labels.mobileNav.close}
              >
                <X />
              </Button>
            </Dialog.Close>
          </div>

          <nav
            aria-label={labels.mobileNav.label}
            className="mt-6 flex flex-col gap-1 border-t border-border/60 pt-4"
          >
            <NavLinks
              locale={locale}
              labels={labels}
              className={drawerLinkClassName}
              onNavigate={() => setOpen(false)}
            />
          </nav>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
