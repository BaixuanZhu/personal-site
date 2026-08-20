import type { MDXComponents } from "mdx/types";

/**
 * MDX 正文的自定义组件映射：让内容作者能直接使用站内一致的样式组件。
 * 未覆盖的标签由 @tailwindcss/typography 的 prose 类兜底。
 */
export const mdxComponents: MDXComponents = {
  /** 链接统一为主题色下划线样式，外链新窗口打开 */
  a: ({ href, children, ...props }) => {
    const isExternal = typeof href === "string" && href.startsWith("http");
    return (
      <a
        href={href}
        {...(isExternal ? { target: "_blank", rel: "noreferrer" } : {})}
        {...props}
      >
        {children}
      </a>
    );
  },
  /** 行内代码补一个轻量圆角底色，代码块由 prose 样式接管 */
  code: ({ className, children, ...props }) => {
    const isBlock = typeof className === "string" && className.includes("language-");
    if (isBlock) {
      return (
        <code className={className} {...props}>
          {children}
        </code>
      );
    }
    return (
      <code
        className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.875em]"
        {...props}
      >
        {children}
      </code>
    );
  },
};
