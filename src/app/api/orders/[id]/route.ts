/**
 * GET /api/orders/[id] — 订单详情
 * PUT /api/orders/[id] — 更新订单状态（模拟支付/取消）
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

/** 订单状态流转规则 */
const VALID_TRANSITIONS: Record<string, string[]> = {
  pending: ["paid", "cancelled"],
  paid: ["shipped", "cancelled"],
  shipped: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
};

/** 获取订单详情 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const { id } = await params;
    const orderId = parseInt(id, 10);
    if (isNaN(orderId)) {
      return NextResponse.json({ error: "无效的订单 ID" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "订单不存在" }, { status: 404 });
    }

    // 只能查看自己的订单（管理员除外）
    if (order.userId !== session.userId && session.role !== "admin") {
      return NextResponse.json({ error: "无权访问" }, { status: 403 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("获取订单详情失败:", error);
    return NextResponse.json({ error: "获取订单详情失败" }, { status: 500 });
  }
}

/** 更新订单状态（模拟支付/发货/取消） */
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
    const orderId = parseInt(id, 10);
    if (isNaN(orderId)) {
      return NextResponse.json({ error: "无效的订单 ID" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return NextResponse.json({ error: "订单不存在" }, { status: 404 });
    }

    if (order.userId !== session.userId && session.role !== "admin") {
      return NextResponse.json({ error: "无权操作" }, { status: 403 });
    }

    const { status } = await request.json();
    if (!status) {
      return NextResponse.json({ error: "缺少目标状态" }, { status: 400 });
    }

    // 校验状态流转合法性
    const allowedNext = VALID_TRANSITIONS[order.status] || [];
    if (!allowedNext.includes(status)) {
      return NextResponse.json(
        {
          error: `不允许从「${order.status}」更改为「${status}」`,
        },
        { status: 400 }
      );
    }

    // 取消订单时恢复库存
    if (status === "cancelled") {
      const orderItems = await prisma.orderItem.findMany({
        where: { orderId: order.id },
      });

      await prisma.$transaction(async (tx) => {
        for (const item of orderItems) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });
        }
        await tx.order.update({
          where: { id: order.id },
          data: { status },
        });
      });
    } else {
      // 其他状态直接更新
      await prisma.order.update({
        where: { id: order.id },
        data: { status },
      });
    }

    return NextResponse.json({ message: "状态更新成功", status });
  } catch (error) {
    console.error("更新订单失败:", error);
    return NextResponse.json({ error: "更新订单失败" }, { status: 500 });
  }
}
