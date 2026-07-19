/**
 * Next.js 中间件 — 保护需要登录的路由
 * /cart、/checkout、/orders、/admin 需要登录
 */
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import {
  getJwtSecret,
  COOKIE_NAME,
  JWT_ALGORITHM,
} from "@/lib/jwt";

/** 需要登录才能访问的路由前缀 */
const PROTECTED_PREFIXES = ["/cart", "/checkout", "/orders", "/admin"];

/** 管理员专用路由前缀 */
const ADMIN_PREFIXES = ["/admin"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 检查是否为受保护路由
  const needsAuth = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );

  if (!needsAuth) {
    return NextResponse.next();
  }

  // 读取 Cookie 中的 session token（使用共享常量，保持与 auth.ts 一致）
  const token = request.cookies.get(COOKIE_NAME)?.value;

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const secret = getJwtSecret();
    const { payload } = await jwtVerify(token, secret, {
      algorithms: [JWT_ALGORITHM],
    });

    // 检查管理员路由
    const needsAdmin = ADMIN_PREFIXES.some((prefix) =>
      pathname.startsWith(prefix)
    );

    if (needsAdmin && payload.role !== "admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
  } catch {
    // Token 无效或过期，跳转登录
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: ["/cart/:path*", "/checkout/:path*", "/orders/:path*", "/admin/:path*"],
};
