/**
 * 渲染 schema.org 结构化数据。
 *
 * 使用原生 <script>（next/script 面向可执行脚本，不适合 JSON-LD）；
 * 转义 "<" 防止数据中出现 </script> 提前闭合标签（见 Next.js JSON-LD 指南）。
 */
type JsonLdData = Record<string, unknown>;

export function JsonLd({ data }: { data: JsonLdData }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
