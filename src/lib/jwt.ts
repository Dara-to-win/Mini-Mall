/**
 * 共享 JWT 配置 — auth.ts 和 middleware.ts 单一数据源
 * 避免密钥和 Cookie 名称在多个文件中重复定义
 */

/** JWT 签名密钥（Uint8Array），由 JWT_SECRET 环境变量派生 */
export function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error(
      "JWT_SECRET 环境变量未设置。请在 .env 中配置 JWT_SECRET=<随机字符串>"
    );
  }
  return new TextEncoder().encode(secret);
}

/** Session Cookie 名称 */
export const COOKIE_NAME = "mini_mall_session";

/** JWT 过期时间（1 天） */
export const JWT_EXPIRES_IN = "1d";

/** Cookie 最大有效时间（秒），与 JWT 过期时间一致 */
export const COOKIE_MAX_AGE = 60 * 60 * 24; // 1 天

/** JWT 签名算法 */
export const JWT_ALGORITHM = "HS256";
