/**
 * POST /api/auth/register — 用户注册
 * 验证邮箱唯一性，密码至少 6 位
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, setSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();

    // 参数校验
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "邮箱、密码和昵称为必填项" },
        { status: 400 }
      );
    }

    // 邮箱格式校验
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "邮箱格式不正确" },
        { status: 400 }
      );
    }

    // 密码长度校验
    if (password.length < 6) {
      return NextResponse.json(
        { error: "密码长度不能少于 6 位" },
        { status: 400 }
      );
    }

    // 昵称长度校验
    if (name.length < 2 || name.length > 20) {
      return NextResponse.json(
        { error: "昵称长度为 2-20 个字符" },
        { status: 400 }
      );
    }

    // 检查邮箱唯一性
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "该邮箱已被注册" },
        { status: 409 }
      );
    }

    // 创建用户
    const hashedPassword = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });

    // 注册成功自动登录
    await setSession(user.id, user.role);

    return NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("注册失败:", error);
    return NextResponse.json({ error: "注册失败，请稍后重试" }, { status: 500 });
  }
}
