/**
 * DELETE /api/admin/categories/[id] — 删除分类
 * 有商品关联的分类不允许删除
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-guard";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  const { id } = await params;
  const categoryId = parseInt(id, 10);
  if (isNaN(categoryId)) {
    return NextResponse.json({ error: "无效的分类 ID" }, { status: 400 });
  }

  try {
    // 事务内先检查再删除，防止竞态
    await prisma.$transaction(async (tx) => {
      const productCount = await tx.product.count({
        where: { categoryId },
      });

      if (productCount > 0) {
        throw new Error(`HAS_PRODUCTS:${productCount}`);
      }

      await tx.category.delete({ where: { id: categoryId } });
    });

    return NextResponse.json({ message: "已删除" });
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("HAS_PRODUCTS:")) {
      const count = error.message.split(":")[1];
      return NextResponse.json(
        { error: `该分类下有 ${count} 件商品，请先移动或删除商品` },
        { status: 400 }
      );
    }
    console.error("删除分类失败:", error);
    return NextResponse.json({ error: "删除分类失败" }, { status: 500 });
  }
}
