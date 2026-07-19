/**
 * 简易内存频率限制 — 按 IP 限制请求频率
 * 适用于单进程开发和小规模部署，生产环境建议使用 Redis 方案
 */
import { NextRequest } from "next/server";

/** 时间窗口（毫秒） */
const WINDOW_MS = 60 * 1000; // 1 分钟

/** 每个时间窗口内最大请求次数 */
const MAX_REQUESTS = 5;

/** 存储：Map<IP, { count, resetTime }> */
const store = new Map<
  string,
  { count: number; resetTime: number }
>();

/** 定期清理过期记录 */
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of store.entries()) {
    if (now > value.resetTime) store.delete(key);
  }
}, 60_000);

/**
 * 检查请求是否超出频率限制
 * 返回 true 表示被限制
 */
export function isRateLimited(request: NextRequest): boolean {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "127.0.0.1";

  const now = Date.now();
  const record = store.get(ip);

  if (!record || now > record.resetTime) {
    // 首次请求或窗口已过期，重置计数
    store.set(ip, { count: 1, resetTime: now + WINDOW_MS });
    return false;
  }

  record.count++;

  if (record.count > MAX_REQUESTS) {
    return true;
  }

  return false;
}
