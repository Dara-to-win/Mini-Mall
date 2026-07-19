/**
 * Admin 权限校验 — 所有 /api/admin/* 路由共用
 */
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

/**
 * 校验当前用户是否为管理员
 * ⚠️ 调用方必须检查返回值：`if (guard.error) return guard.error;`
 * 漏写此检查会导致路由无保护（TypeScript 不会报错）
 */
export async function requireAdmin() {
  const session = await getSession();
  if (!session) {
    return { error: NextResponse.json({ error: "请先登录" }, { status: 401 }) };
  }
  if (session.role !== "admin") {
    return { error: NextResponse.json({ error: "无权访问" }, { status: 403 }) };
  }
  return { session };
}
