import { cloneElement, isValidElement, type ReactElement } from "react";
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
    // 无语言标注的围栏块（``` 不带语言）没有 language-* 类，
    // 靠 pre 组件打的 data-mdx-block 标记识别为块级，避免误加行内底色
    const isBlock =
      (typeof className === "string" && className.includes("language-")) ||
      (props as { "data-mdx-block"?: string })["data-mdx-block"] === "true";
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
  /**
   * 围栏代码块容器：统一终端风格（黑底白字），右上角小字显示语言；
   * 无语言标注的块（``` 不带语言，如目录树）没有 language-* 类，不显示标签。
   * 同时给子 code 打块级标记，供 code 组件区分块级与行内。
   */
  pre: ({ children, ...props }) => {
    const child = isValidElement(children)
      ? (children as ReactElement<{ className?: string; "data-mdx-block"?: string }>)
      : undefined;
    const language = /language-([\w-]+)/.exec(child?.props.className ?? "")?.[1];
    const blockCode = child
      ? cloneElement(child, { "data-mdx-block": "true" })
      : children;
    return (
      <div className="relative my-6 overflow-hidden rounded-xl bg-black text-white dark:ring-1 dark:ring-white/10">
        {language && (
          <span className="absolute right-4 top-2 font-mono text-xs uppercase tracking-widest text-white/40 select-none">
            {language}
          </span>
        )}
        <pre
          {...props}
          className={
            language
              ? "m-0 overflow-x-auto px-5 pb-4 pt-9 text-sm leading-relaxed"
              : "m-0 overflow-x-auto p-4 text-sm leading-relaxed"
          }
        >
          {blockCode}
        </pre>
      </div>
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
