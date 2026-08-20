import { NextResponse, type NextRequest } from "next/server";
import { LOCALE_COOKIE, defaultLocale, isLocale } from "@/lib/i18n/config";

/**
 * 语言协商代理（Next 16 以 proxy.ts 取代 middleware.ts）：
 * 把不带语言前缀的请求重定向到用户偏好的语言版本。
 * 偏好优先级：NEXT_LANG Cookie（用户用切换器显式选择过）> 默认中文。
 * 不侦测 Accept-Language，保证未表达偏好的访客默认进入中文站。
 * 已带语言前缀（/zh、/en）的请求直接放行。
 */
export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const firstSegment = pathname.split("/")[1] ?? "";

  if (isLocale(firstSegment)) {
    return NextResponse.next();
  }

  const cookieLocale = request.cookies.get(LOCALE_COOKIE)?.value;
  const locale =
    cookieLocale && isLocale(cookieLocale) ? cookieLocale : defaultLocale;

  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

/**
 * 只拦截页面请求：跳过 _next 内部路径、API 与带扩展名的静态文件（图片/简历等）。
 */
export const config = {
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
