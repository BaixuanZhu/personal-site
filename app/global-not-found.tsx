import Link from "next/link";

/**
 * 全局 404 页：捕获所有未匹配路由（含非法语言前缀）。
 * global-not-found 独立于任何布局渲染，必须自带 html/body，故采用中英双语展示。
 */
export default function GlobalNotFound() {
  return (
    <html lang="zh-CN">
      <body
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
          padding: "8rem 1.5rem",
          textAlign: "center",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <h1 style={{ fontSize: "1.5rem", fontWeight: 600 }}>
          页面不存在 · Page Not Found
        </h1>
        <p style={{ color: "#666" }}>
          地址可能有误，或该内容尚未发布。The page you are looking for does not
          exist.
        </p>
        <nav style={{ display: "flex", gap: "0.75rem" }}>
          <Link
            href="/zh"
            style={{ color: "#2563eb", textDecoration: "underline" }}
          >
            返回首页
          </Link>
          <Link
            href="/en"
            style={{ color: "#2563eb", textDecoration: "underline" }}
          >
            Back to Home
          </Link>
        </nav>
      </body>
    </html>
  );
}
