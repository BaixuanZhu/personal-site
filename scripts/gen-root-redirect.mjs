/**
 * 生成 out/index.html 根跳转页。
 * 静态导出（NEXT_OUTPUT=export）下 proxy.ts 不执行，根路径缺少语言协商入口；
 * 该页读 NEXT_LANG Cookie 跳转 /zh 或 /en，无偏好默认中文（与 proxy 逻辑一致）。
 * 子路径部署（GitHub Pages）由 BASE_PATH 环境变量提供前缀；根路径部署（EdgeOne）留空。
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const base = process.env.BASE_PATH ?? "";

const html = `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <title>Galaxy · 朱柏轩</title>
    <script>
      var m = document.cookie.match(/(?:^|;\\s*)NEXT_LANG=(zh|en)\\b/);
      var base = "${base}";
      window.location.replace(m ? base + "/" + m[1] + "/" : base + "/zh/");
    </script>
    <noscript><meta http-equiv="refresh" content="0;url=${base}/zh/" /></noscript>
  </head>
  <body></body>
</html>
`;

mkdirSync("out", { recursive: true });
writeFileSync(join("out", "index.html"), html);
console.log(`out/index.html written (BASE_PATH="${base}")`);
