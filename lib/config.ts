/**
 * 站点全局配置 —— 与语言无关的身份信息、社交链接与导航结构。
 * 可翻译文案见 lib/i18n/dictionaries/（zh.ts / en.ts），
 * 修改身份信息时两处都需要检查。
 */
export const siteConfig = {
  /** 展示姓名（英文，全语言共用） */
  name: "Galaxy",
  /** 站点部署地址（用于生成 OG 绝对链接，部署后替换为真实域名） */
  url: "https://example.com",
  /** 联系邮箱 */
  email: "wy2359117018@163.com",
  /** GitHub 主页 */
  github: "https://github.com/BaixuanZhu",
  /** 简历 PDF（存放于 public/ 目录） */
  resume: "/resume.pdf",
  /** 头像（存放于 public/ 目录） */
  avatar: "/avatar.svg",
} as const;

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
