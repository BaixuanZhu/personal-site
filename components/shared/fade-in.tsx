"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

interface FadeInProps {
  children: ReactNode;
  /** 动画延迟（秒），用于列表错落入场 */
  delay?: number;
  /** 附加到容器上的类名 */
  className?: string;
}

/**
 * 滚动进入视口时淡入上浮的动画容器。
 * 基于 motion 的 whileInView 实现，只播放一次；供服务端区块组件复用。
 */
export function FadeIn({ children, delay = 0, className }: FadeInProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
