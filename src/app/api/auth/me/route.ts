/**
 * GET /api/auth/me — 获取当前登录用户信息
 * 未登录返回 401
 */
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("获取用户信息失败:", error);
    return NextResponse.json(
      { error: "获取用户信息失败" },
      { status: 500 }
    );
  }
}
