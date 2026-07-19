/**
 * 认证模块 — JWT Session + bcrypt 密码哈希
 * Session 存储在 httpOnly Cookie 中，防止 XSS 攻击
 */
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import {
  getJwtSecret,
  COOKIE_NAME,
  JWT_EXPIRES_IN,
  COOKIE_MAX_AGE,
  JWT_ALGORITHM,
} from "@/lib/jwt";

// 用于时序攻击防御的伪造哈希（bcrypt hash of "not-a-real-password" with salt rounds=12）
const FAKE_HASH =
  "$2a$12$LJ3m4ys3GZfnYMz8kVsKaOqHkXmNtZG8N4jVTqU2qzOGq3kLmJzOe";

/** Session Cookie 配置 */
function getCookieOptions(): {
  httpOnly: boolean;
  secure: boolean;
  sameSite: "lax";
  path: string;
  maxAge: number;
} {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  };
}

/**
 * 使用 bcryptjs 哈希密码
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}

/**
 * 验证密码是否匹配
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * 登录成功后设置 JWT Session Cookie
 */
export async function setSession(userId: number, role: string): Promise<void> {
  const secret = getJwtSecret();

  const token = await new SignJWT({ userId, role })
    .setProtectedHeader({ alg: JWT_ALGORITHM })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRES_IN)
    .sign(secret);

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, getCookieOptions());
}

/**
 * 从 Cookie 中解析当前用户的 Session 信息
 * 返回 null 表示未登录或 Token 无效
 */
export async function getSession(): Promise<{
  userId: number;
  role: string;
} | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;

    if (!token) return null;

    const secret = getJwtSecret();
    const { payload } = await jwtVerify(token, secret, {
      algorithms: [JWT_ALGORITHM],
    });
    return {
      userId: payload.userId as number,
      role: payload.role as string,
    };
  } catch {
    return null;
  }
}

/**
 * 获取当前登录用户的完整信息（不含密码）
 */
export async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
    },
  });

  return user;
}

/**
 * 清除 Session Cookie（退出登录）
 */
export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, "", {
    ...getCookieOptions(),
    maxAge: 0, // 立即过期
  });
}

/**
 * 防时序攻击的密码验证 — 无论用户是否存在都执行 bcrypt
 * 返回 { user } 或 { user: null }
 */
export async function loginWithTimingDefense(
  email: string,
  password: string
): Promise<{
  user: {
    id: number;
    email: string;
    name: string;
    role: string;
    password: string;
  } | null;
}> {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  // 用户存在 → 验证真实密码；用户不存在 → 验证伪造哈希（耗时相近，防止时序侧信道）
  const hash = user ? user.password : FAKE_HASH;
  const isValid = await bcrypt.compare(password, hash);

  if (user && isValid) {
    return { user };
  }

  return { user: null };
}
