/**
 * 共享工具函数
 */
import { Prisma } from "@/generated/prisma/client";

/** 安全解析分页页码，非数字或负数默认返回 1 */
export function parsePage(raw: string | undefined): number {
  if (!raw) return 1;
  const n = parseInt(raw, 10);
  if (isNaN(n) || n < 1) return 1;
  return n;
}

/** 安全解析商品 ID，负数或 NaN 返回 null */
export function parseProductId(raw: string): number | null {
  const id = parseInt(raw, 10);
  if (isNaN(id) || id < 1) return null;
  return id;
}

/** 转义 SQL LIKE 通配符 % 和 _ */
export function escapeLike(str: string): string {
  return str.replace(/[%_]/g, "\\$&");
}

/** 构建商品查询条件 */
export function buildProductWhereClause(
  search: string,
  categorySlug: string,
): Prisma.ProductWhereInput {
  const where: Prisma.ProductWhereInput = {};

  if (search) {
    const escaped = escapeLike(search);
    where.OR = [
      { name: { contains: escaped } },
      { description: { contains: escaped } },
    ];
  }

  if (categorySlug) {
    where.category = { slug: categorySlug };
  }

  return where;
}

/** 格式化价格为人民币显示 */
export function formatPrice(price: number): string {
  return `¥${price.toFixed(2)}`;
}

/** 每页商品数量 */
export const PAGE_SIZE = 9;
