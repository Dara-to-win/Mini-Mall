/**
 * GET /api/products/[id] — 商品详情，包含分类信息
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseProductId } from "@/lib/utils";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const productId = parseProductId(id);

  if (productId === null) {
    return NextResponse.json({ error: "无效的商品 ID" }, { status: 400 });
  }

  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { category: true },
    });

    if (!product) {
      return NextResponse.json({ error: "商品不存在" }, { status: 404 });
    }

    return NextResponse.json(product, {
      headers: {
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=120",
      },
    });
  } catch (error) {
    console.error("获取商品详情失败:", error);
    return NextResponse.json({ error: "获取商品详情失败" }, { status: 500 });
  }
}
