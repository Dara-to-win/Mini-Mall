/**
 * PUT /api/admin/orders/[id] — 管理员更新订单状态
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-guard";

/** 订单状态流转规则 */
const VALID_TRANSITIONS: Record<string, string[]> = {
  pending: ["paid", "cancelled"],
  paid: ["shipped", "cancelled"],
  shipped: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
};

const STATUS_LABELS: Record<string, string> = {
  pending: "待付款",
  paid: "已支付",
  shipped: "已发货",
  completed: "已完成",
  cancelled: "已取消",
};

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  const { id } = await params;
  const orderId = parseInt(id, 10);
  if (isNaN(orderId)) {
    return NextResponse.json({ error: "无效的订单 ID" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { status } = body;

    if (!status || !STATUS_LABELS[status]) {
      return NextResponse.json({ error: "无效的状态值" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) return NextResponse.json({ error: "订单不存在" }, { status: 404 });

    const allowed = VALID_TRANSITIONS[order.status] || [];
    if (!allowed.includes(status)) {
      return NextResponse.json(
        { error: `不允许从「${STATUS_LABELS[order.status]}」更改为「${STATUS_LABELS[status]}」` },
        { status: 400 }
      );
    }

    // 取消时恢复库存
    if (status === "cancelled") {
      const items = await prisma.orderItem.findMany({ where: { orderId } });
      await prisma.$transaction(async (tx) => {
        const updated = await tx.order.updateMany({
          where: { id: orderId, status: order.status },
          data: { status },
        });
        if (updated.count === 0) throw new Error("ORDER_STATUS_CHANGED");
        for (const item of items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });
        }
      });
    } else {
      const updated = await prisma.order.updateMany({
        where: { id: orderId, status: order.status },
        data: { status },
      });
      if (updated.count === 0) {
        return NextResponse.json({ error: "订单状态已变更" }, { status: 409 });
      }
    }

    return NextResponse.json({ message: "状态更新成功", status });
  } catch (error) {
    if (error instanceof Error && error.message === "ORDER_STATUS_CHANGED") {
      return NextResponse.json({ error: "订单状态已变更" }, { status: 409 });
    }
    console.error("更新订单失败:", error);
    return NextResponse.json({ error: "更新订单失败" }, { status: 500 });
  }
}
