/**
 * PUT /api/cart/[id] — 修改购物车项数量
 * DELETE /api/cart/[id] — 删除购物车项
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

/** 确认购物车项属于当前用户 */
async function getOwnedCartItem(
  cartItemId: number,
  userId: number
) {
  const item = await prisma.cartItem.findUnique({
    where: { id: cartItemId },
    include: { product: true },
  });

  if (!item) return null;
  if (item.userId !== userId) return null;
  return item;
}

/** 修改数量 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const { id } = await params;
    const cartItemId = parseInt(id, 10);
    if (isNaN(cartItemId)) {
      return NextResponse.json({ error: "无效的购物车项 ID" }, { status: 400 });
    }

    const item = await getOwnedCartItem(cartItemId, session.userId);
    if (!item) {
      return NextResponse.json({ error: "购物车项不存在" }, { status: 404 });
    }

    const { quantity } = await request.json();
    const newQuantity = parseInt(String(quantity), 10);

    if (isNaN(newQuantity) || newQuantity < 0) {
      return NextResponse.json({ error: "无效的数量" }, { status: 400 });
    }

    // 数量为 0 等同于删除
    if (newQuantity === 0) {
      await prisma.cartItem.delete({ where: { id: cartItemId } });
      return NextResponse.json({ message: "已删除" });
    }

    // 检查库存
    if (newQuantity > item.product.stock) {
      return NextResponse.json(
        { error: `库存不足，当前库存 ${item.product.stock} 件` },
        { status: 400 }
      );
    }

    const updated = await prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity: newQuantity },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("修改购物车失败:", error);
    return NextResponse.json({ error: "修改购物车失败" }, { status: 500 });
  }
}

/** 删除购物车项 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const { id } = await params;
    const cartItemId = parseInt(id, 10);
    if (isNaN(cartItemId)) {
      return NextResponse.json({ error: "无效的购物车项 ID" }, { status: 400 });
    }

    const item = await getOwnedCartItem(cartItemId, session.userId);
    if (!item) {
      return NextResponse.json({ error: "购物车项不存在" }, { status: 404 });
    }

    await prisma.cartItem.delete({ where: { id: cartItemId } });

    return NextResponse.json({ message: "已删除" });
  } catch (error) {
    console.error("删除购物车项失败:", error);
    return NextResponse.json({ error: "删除购物车项失败" }, { status: 500 });
  }
}
