"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ComponentProps } from "react";

/**
 * 主题切换 Provider，包装 next-themes 以 class 策略驱动 shadcn/ui 的亮/暗样式。
 * 必须在客户端组件中使用（依赖 document 与 localStorage）。
 */
export function ThemeProvider({
  children,
  ...props
}: ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
