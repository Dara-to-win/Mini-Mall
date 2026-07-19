/**
 * GET /api/products — 商品列表
 * 查询参数：search（模糊搜索）、category（按分类 slug 筛选）、page（分页，默认 1，每页 9 条）
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parsePage, buildProductWhereClause, PAGE_SIZE } from "@/lib/utils";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const categorySlug = searchParams.get("category") || "";
  const page = parsePage(searchParams.get("page") || undefined);

  try {
    const where = buildProductWhereClause(search, categorySlug);

    // 并行查询：商品总数 + 当前页数据
    const [total, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        include: { category: true },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return NextResponse.json(
      {
        products,
        pagination: {
          page,
          pageSize: PAGE_SIZE,
          total,
          totalPages: Math.ceil(total / PAGE_SIZE),
        },
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      }
    );
  } catch (error) {
    console.error("获取商品列表失败:", error);
    return NextResponse.json({ error: "获取商品列表失败" }, { status: 500 });
  }
}
