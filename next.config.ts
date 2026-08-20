import type { NextConfig } from "next";

/**
 * 静态导出模式：GitHub Pages 等纯静态托管时由 CI 注入 NEXT_OUTPUT=export 开启。
 * 本地开发与 Node 服务器部署（pnpm build && pnpm start）不受影响。
 */
const isStaticExport = process.env.NEXT_OUTPUT === "export";

/**
 * 部署子路径：GitHub Pages 项目站点部署在 /<仓库名> 下，由 CI 注入
 * NEXT_PUBLIC_BASE_PATH（如 /personal-site）。next/link 与 next/image 会自动
 * 拼接该前缀，原生 <a>/元数据中的站内绝对路径需通过 lib/config.ts 的 basePath 手动拼接。
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  ...(isStaticExport
    ? {
        output: "export" as const,
        // 目录式 URL 与 Pages 的静态文件布局一致，免去 301 跳转
        trailingSlash: true,
        // 静态托管没有 next/image 优化服务，直接输出原图
        images: { unoptimized: true },
      }
    : {}),
  ...(basePath ? { basePath, assetPrefix: basePath } : {}),
};

export default nextConfig;
