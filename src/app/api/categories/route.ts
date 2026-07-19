/**
 * GET /api/categories — 分类列表，包含每个分类下的商品数量
 */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(categories, {
      headers: {
        "Cache-Control": "public, s-maxage=120, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    console.error("获取分类列表失败:", error);
    return NextResponse.json({ error: "获取分类列表失败" }, { status: 500 });
  }
}
