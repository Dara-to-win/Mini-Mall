/**
 * GET /api/admin/products — 商品列表
 * POST /api/admin/products — 新增商品
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-guard";

export async function GET() {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  try {
    const products = await prisma.product.findMany({
      include: { category: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(products);
  } catch (error) {
    console.error("获取商品列表失败:", error);
    return NextResponse.json({ error: "获取商品列表失败" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  try {
    const body = await request.json();
    const { name, description, price, image, stock, categoryId } = body;

    if (!name || !description || price === undefined || categoryId === undefined) {
      return NextResponse.json({ error: "名称、描述、价格和分类为必填项" }, { status: 400 });
    }

    const parsedPrice = parseFloat(price);
    const parsedStock = parseInt(stock || "0", 10);
    const parsedCategoryId = parseInt(categoryId, 10);

    if (isNaN(parsedPrice) || parsedPrice < 0) {
      return NextResponse.json({ error: "价格必须为非负数字" }, { status: 400 });
    }
    if (isNaN(parsedStock) || parsedStock < 0) {
      return NextResponse.json({ error: "库存必须为非负整数" }, { status: 400 });
    }
    if (isNaN(parsedCategoryId) || parsedCategoryId < 1) {
      return NextResponse.json({ error: "请选择有效分类" }, { status: 400 });
    }

    // 校验分类是否存在
    const category = await prisma.category.findUnique({ where: { id: parsedCategoryId } });
    if (!category) {
      return NextResponse.json({ error: "所选分类不存在" }, { status: 400 });
    }

    const product = await prisma.product.create({
      data: {
        name,
        description: description || "",
        price: parsedPrice,
        image: image || null,
        stock: parsedStock,
        categoryId: parsedCategoryId,
      },
      include: { category: true },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("创建商品失败:", error);
    return NextResponse.json({ error: "创建商品失败" }, { status: 500 });
  }
}
