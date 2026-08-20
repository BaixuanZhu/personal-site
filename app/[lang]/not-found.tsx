import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * 语言前缀内未匹配路由时的 404 页。
 * not-found 约定无法读取语言参数，故采用中英双语展示。
 */
export default function LangNotFound() {
  return (
    <main className="mx-auto flex max-w-6xl flex-1 flex-col items-center justify-center gap-4 px-6 py-32 text-center">
      <h1 className="font-heading text-2xl font-semibold">
        页面不存在 · Page Not Found
      </h1>
      <p className="text-muted-foreground">
        地址可能有误，或该内容尚未发布。The page you are looking for does not
        exist.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Button variant="outline" asChild>
          <Link href="/zh">
            <ArrowLeft data-icon="inline-start" />
            返回首页
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/en">Back to Home</Link>
        </Button>
      </div>
    </main>
  );
}
