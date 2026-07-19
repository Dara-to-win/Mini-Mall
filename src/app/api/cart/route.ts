/**
 * GET /api/cart — 获取当前用户购物车
 * POST /api/cart — 加入购物车
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

/** 获取购物车列表 */
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const items = await prisma.cartItem.findMany({
      where: { userId: session.userId },
      include: {
        product: {
          include: { category: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // 计算每项小计和总价
    const cartItems = items.map((item) => ({
      id: item.id,
      productId: item.productId,
      name: item.product.name,
      image: item.product.image,
      price: item.product.price,
      stock: item.product.stock,
      quantity: item.quantity,
      subtotal: item.product.price * item.quantity,
    }));

    const total = cartItems.reduce((sum, item) => sum + item.subtotal, 0);

    return NextResponse.json({ items: cartItems, total });
  } catch (error) {
    console.error("获取购物车失败:", error);
    return NextResponse.json({ error: "获取购物车失败" }, { status: 500 });
  }
}

/** 加入购物车 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const { productId, quantity = 1 } = await request.json();
    const parsedProductId = parseInt(String(productId), 10);
    const parsedQuantity = parseInt(String(quantity), 10);

    if (isNaN(parsedProductId) || parsedProductId < 1) {
      return NextResponse.json({ error: "无效的商品 ID" }, { status: 400 });
    }

    if (isNaN(parsedQuantity) || parsedQuantity < 1) {
      return NextResponse.json({ error: "数量至少为 1" }, { status: 400 });
    }

    // 检查商品和库存
    const product = await prisma.product.findUnique({
      where: { id: parsedProductId },
    });

    if (!product) {
      return NextResponse.json({ error: "商品不存在" }, { status: 404 });
    }

    // 检查已有购物车项
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        userId_productId: {
          userId: session.userId,
          productId: parsedProductId,
        },
      },
    });

    const newQuantity = (existingItem?.quantity || 0) + parsedQuantity;

    if (newQuantity > product.stock) {
      return NextResponse.json(
        { error: `库存不足，当前库存 ${product.stock} 件` },
        { status: 400 }
      );
    }

    // upsert 购物车项
    const cartItem = await prisma.cartItem.upsert({
      where: {
        userId_productId: {
          userId: session.userId,
          productId: parsedProductId,
        },
      },
      create: {
        userId: session.userId,
        productId: parsedProductId,
        quantity: parsedQuantity,
      },
      update: {
        quantity: newQuantity,
      },
    });

    return NextResponse.json(cartItem, { status: 201 });
  } catch (error) {
    console.error("加入购物车失败:", error);
    return NextResponse.json({ error: "加入购物车失败" }, { status: 500 });
  }
}
