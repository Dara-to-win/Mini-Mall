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

    // 检查库存
    const insufficientStock: { name: string; stock: number }[] = [];
    for (const item of cartItems) {
      if (item.quantity > item.product.stock) {
        insufficientStock.push({
          name: item.product.name,
          stock: item.product.stock,
        });
      }
    }

    if (insufficientStock.length > 0) {
      return NextResponse.json(
        {
          error: "库存不足",
          details: insufficientStock.map(
            (i) => `${i.name}（仅剩 ${i.stock} 件）`
          ),
        },
        { status: 400 }
      );
    }

    // 计算总价
    const total = cartItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );

    // 数据库事务：创建订单 → 扣减库存 → 清空购物车
    const order = await prisma.$transaction(async (tx) => {
      // 1. 创建订单
      const newOrder = await tx.order.create({
        data: {
          userId: session.userId,
          status: "pending",
          total,
          items: {
            create: cartItems.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.product.price, // 下单时单价快照
            })),
          },
        },
        include: {
          items: {
            include: { product: true },
          },
        },
      });

      // 2. 扣减库存
      for (const item of cartItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      // 3. 清空购物车
      await tx.cartItem.deleteMany({
        where: { userId: session.userId },
      });

      return newOrder;
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error("创建订单失败:", error);
    return NextResponse.json({ error: "创建订单失败" }, { status: 500 });
  }
}
