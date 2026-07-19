/**
 * POST /api/auth/login — 用户登录
 * 防时序侧信道攻击 + 防撞库攻击 + 频率限制
 */
import { NextRequest, NextResponse } from "next/server";
import { setSession, loginWithTimingDefense } from "@/lib/auth";
import { isRateLimited } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  // 频率限制
  if (isRateLimited(request)) {
    return NextResponse.json(
      { error: "请求过于频繁，请稍后重试" },
      { status: 429 }
    );
  }

  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "邮箱和密码为必填项" },
        { status: 400 }
      );
    }

    // 防时序侧信道验证：无论用户是否存在，都执行 bcrypt.compare
    const { user } = await loginWithTimingDefense(email, password);

    if (!user) {
      return NextResponse.json(
        { error: "邮箱或密码不正确" },
        { status: 401 }
      );
    }

    // 登录成功，写入 Session
    await setSession(user.id, user.role);

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("登录失败:", error);
    return NextResponse.json({ error: "登录失败，请稍后重试" }, { status: 500 });
  }
}
