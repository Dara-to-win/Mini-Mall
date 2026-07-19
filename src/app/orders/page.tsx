/**
 * 订单列表页 — 我的订单
 */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";

interface Order {
  id: number;
  status: string;
  total: number;
  createdAt: string;
  items: { quantity: number; product: { name: string; image: string | null } }[];
}

/** 订单状态中文映射 */
const STATUS_LABELS: Record<string, string> = {
  pending: "待付款",
  paid: "已支付",
  shipped: "已发货",
  completed: "已完成",
  cancelled: "已取消",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  paid: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-gray-100 text-gray-500",
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/orders")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setOrders(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center text-gray-400">
        加载中...
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">我的订单</h1>

      {orders.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg">暂无订单</p>
          <Link
            href="/"
            className="text-sm text-blue-600 hover:text-blue-800 mt-2 inline-block"
          >
            去逛逛
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/orders/${order.id}`}
              className="block bg-white rounded-lg border p-4 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">
                  订单 #{order.id} · {new Date(order.createdAt).toLocaleDateString("zh-CN")}
                </span>
                <span
                  className={`text-xs px-2 py-0.5 rounded ${
                    STATUS_COLORS[order.status] || STATUS_COLORS.pending
                  }`}
                >
                  {STATUS_LABELS[order.status] || order.status}
                </span>
              </div>

              <div className="flex items-center gap-2 mb-2">
                {order.items.slice(0, 3).map((item, i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded bg-gray-100 shrink-0 overflow-hidden"
                  >
                    {item.product.image ? (
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : null}
                  </div>
                ))}
                {order.items.length > 3 && (
                  <span className="text-xs text-gray-400">
                    +{order.items.length - 3}
                  </span>
                )}
                <span className="text-xs text-gray-500 ml-auto">
                  共 {order.items.reduce((s, i) => s + i.quantity, 0)} 件
                </span>
              </div>

              <div className="text-right text-lg font-bold text-red-600">
                {formatPrice(order.total)}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
