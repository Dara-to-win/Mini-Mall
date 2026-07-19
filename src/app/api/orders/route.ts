/**
 * GET /api/orders — 我的订单列表
 * POST /api/orders — 从购物车创建订单
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

/** 获取订单列表 */
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const orders = await prisma.order.findMany({
      where: { userId: session.userId },
      include: {
        items: {
          include: { product: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("获取订单列表失败:", error);
    return NextResponse.json({ error: "获取订单列表失败" }, { status: 500 });
  }
}

/** 从购物车创建订单 */
export async function POST() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    // 获取购物车商品
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: session.userId },
      include: { product: true },
    });

    if (cartItems.length === 0) {
      return NextResponse.json({ error: "购物车为空" }, { status: 400 });
    }

    // 计算总价
    const total = cartItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );

    // 数据库事务：库存校验 → 创建订单 → 扣减库存 → 清空购物车
    // 库存校验在事务内执行，消除 TOCTOU 竞态
    const order = await prisma.$transaction(async (tx) => {
      // 1. 事务内重新读取并校验库存
      const insufficientStock: string[] = [];
      for (const item of cartItems) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
          select: { stock: true, name: true },
        });

        if (!product || item.quantity > product.stock) {
          insufficientStock.push(
            `${product?.name || "未知商品"}（仅剩 ${product?.stock || 0} 件）`
          );
        }
      }

      if (insufficientStock.length > 0) {
        throw new Error(`INSUFFICIENT_STOCK:${insufficientStock.join("；")}`);
      }

      // 2. 创建订单
      const newOrder = await tx.order.create({
        data: {
          userId: session.userId,
          status: "pending",
          total,
          items: {
            create: cartItems.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.product.price,
            })),
          },
        },
        include: {
          items: {
            include: { product: true },
          },
        },
      });

      // 3. 扣减库存（使用 WHERE stock >= quantity 防止负数库存）
      for (const item of cartItems) {
        await tx.product.update({
          where: {
            id: item.productId,
            stock: { gte: item.quantity },
          },
          data: { stock: { decrement: item.quantity } },
        });
      }

      // 4. 清空购物车
      await tx.cartItem.deleteMany({
        where: { userId: session.userId },
      });

      return newOrder;
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    // 事务内库存不足错误
    if (error instanceof Error && error.message.startsWith("INSUFFICIENT_STOCK:")) {
      return NextResponse.json(
        {
          error: "库存不足",
          details: error.message.replace("INSUFFICIENT_STOCK:", "").split("；"),
        },
        { status: 400 }
      );
    }
    console.error("创建订单失败:", error);
    return NextResponse.json({ error: "创建订单失败" }, { status: 500 });
  }
}
