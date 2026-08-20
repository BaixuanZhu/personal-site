"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";

const emptySubscribe = () => () => {};

interface ThemeToggleProps {
  /** 按当前语言本地化的无障碍文案 */
  labels: { toggle: string; toLight: string; toDark: string };
}

/**
 * 亮/暗主题切换按钮。
 * 在亮色与暗色之间循环切换；通过 useSyncExternalStore 判断水合完成，
 * 避免服务端/客户端渲染不一致。
 */
export function ThemeToggle({ labels }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme();
  // 服务端与首次客户端渲染返回 false，水合后返回 true
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        aria-label={labels.toggle}
        className="opacity-0"
      />
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={isDark ? labels.toLight : labels.toDark}
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {isDark ? <Sun /> : <Moon />}
    </Button>
  );
}
