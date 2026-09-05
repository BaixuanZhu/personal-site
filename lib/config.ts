/**
 * 站点全局配置 —— 与语言无关的身份信息、社交链接与导航结构。
 * 可翻译文案见 lib/i18n/dictionaries/（zh.ts / en.ts），
 * 修改身份信息时两处都需要检查。
 */
export const siteConfig = {
  /** 展示姓名（英文，全语言共用） */
  name: "Galaxy",
  /** 站点部署地址（用于生成 OG 绝对链接；CI 静态导出时注入 NEXT_PUBLIC_SITE_URL） */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com",
  /** 联系邮箱 */
  email: "wy2359117018@163.com",
  /** GitHub 主页 */
  github: "https://github.com/BaixuanZhu",
} as const;

/**
 * 静态导出时的部署子路径（如 GitHub Pages 的 /personal-site）。
 * 开发与 Node 服务器部署时为空字符串。
 * next/link 会自动拼接前缀；unoptimized 的 next/image 与原生 <a> 需通过
 * withBasePath 手动拼接（静态导出模式下 next/image 不自动加前缀）。
 */
export const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/**
 * 为站内绝对路径拼接部署子路径。
 *
 * @param path 以 / 开头的站内路径（如 /images/projects/jvm-zh.svg）
 * @returns 带子路径前缀的路径（非导出构建原样返回）
 */
export function withBasePath(path: string): string {
  return `${basePath}${path}`;
}

/** 顶部导航链接项（文案通过 key 从字典 nav 字段获取） */
export interface NavItem {
  /** 字典 nav 字段键，用于取本地化文案 */
  key: "projects" | "skills" | "about" | "contact";
  /** 链接地址（以 / 开头；渲染时拼接语言前缀，如 /#projects → /zh#projects） */
  href: string;
}

/** 顶部导航数据（Header 与 Footer 共用） */
export const navItems: NavItem[] = [
  { key: "projects", href: "/#projects" },
  { key: "skills", href: "/#skills" },
  { key: "about", href: "/about" },
  { key: "contact", href: "/#contact" },
];
