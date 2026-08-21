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
  /** Markdown 表格：外框 + 表头底色 + 窄屏横向滚动，接管 prose 默认（prose 为零优先级，此处工具类必胜） */
  table: ({ children }) => (
    <div className="my-6 overflow-x-auto rounded-xl border border-border/60">
      <table className="w-full border-collapse text-sm">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-muted/50">{children}</thead>,
  tbody: ({ children }) => <tbody>{children}</tbody>,
  th: ({ children }) => (
    <th className="px-4 py-3 text-left font-medium whitespace-nowrap">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border-t border-border/60 px-4 py-3 align-top">{children}</td>
  ),
};
