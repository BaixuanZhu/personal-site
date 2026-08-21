"use client";

import { useSyncExternalStore } from "react";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

/**
 * 订阅系统"减少动态效果"设置的变化（仅客户端挂载后生效）。
 *
 * @param callback 设置变化时的回调
 * @returns 取消订阅函数
 */
function subscribeReducedMotion(callback: () => void): () => void {
  const mql = window.matchMedia(REDUCED_MOTION_QUERY);
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

/**
 * 是否允许播放 motion 入场动画：仅客户端挂载后、且用户未开启系统级
 * "减少动态效果"时为 true。
 *
 * SSR 与 hydration 首帧恒为 false（getServerSnapshot），保证服务端与客户端
 * 首帧渲染完全一致 —— 规避 reduced-motion 设备上两种问题：
 * ① motion 初始内联样式（opacity/transform）导致的 hydration 属性不匹配；
 * ② 在禁用动画的设备上挂载 motion 组件触发的开发期 reduced-motion 警告。
 * 动画因此只在挂载完成后按需接管（首屏内容在无 JS 时也完整可见）。
 *
 * @returns 是否允许动画
 */
export function useAllowMotion(): boolean {
  return useSyncExternalStore(
    subscribeReducedMotion,
    () => !window.matchMedia(REDUCED_MOTION_QUERY).matches,
    () => false,
  );
}
