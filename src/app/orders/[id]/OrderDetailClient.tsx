/**
 * 订单详情（客户端组件）
 */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";

interface OrderItem {
  id: number;
  quantity: number;
  price: number;
  product: {
    id: number;
    name: string;
    image: string | null;
  };
}

interface Order {
  id: number;
  status: string;
  total: number;
  createdAt: string;
  items: OrderItem[];
}

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

export function OrderDetailClient({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState("");

  useEffect(() => {
    fetch(`/api/orders/${orderId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setOrder(data);
        }
      })
      .catch(() => setError("网络错误"))
      .finally(() => setLoading(false));
  }, [orderId]);

  /** 更新订单状态 */
  async function updateStatus(status: string) {
    setActionLoading(status);
    setError("");
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (res.ok) {
        router.refresh();
        setOrder((prev) => (prev ? { ...prev, status } : prev));
      } else {
        setError(data.error || "操作失败");
      }
    } catch {
      setError("网络错误");
    } finally {
      setActionLoading("");
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center text-gray-400">
        加载中...
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <Link href="/orders" className="text-blue-600 text-sm">
          ← 返回订单列表
        </Link>
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">订单 #{order.id}</h1>
        <span
          className={`text-sm px-3 py-1 rounded ${
            STATUS_COLORS[order.status] || STATUS_COLORS.pending
          }`}
        >
          {STATUS_LABELS[order.status] || order.status}
        </span>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded mb-4">
          {error}
          <button onClick={() => setError("")} className="ml-2 underline">
            关闭
          </button>
        </div>
      )}

      <p className="text-sm text-gray-500 mb-4">
        下单时间：{new Date(order.createdAt).toLocaleString("zh-CN")}
      </p>

      {/* 商品明细 */}
      <div className="bg-white rounded-lg border divide-y mb-4">
        {order.items.map((item) => (
          <div key={item.id} className="flex items-center gap-3 p-3">
            <Link href={`/products/${item.product.id}`} className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-12 h-12 rounded bg-gray-100 shrink-0 overflow-hidden">
                {item.product.image ? (
                  <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                ) : null}
              </div>
              <span className="text-sm text-gray-900 line-clamp-1 flex-1">
                {item.product.name}
              </span>
            </Link>
            <span className="text-sm text-gray-500">{formatPrice(item.price)}</span>
            <span className="text-sm text-gray-500 mx-2">×{item.quantity}</span>
            <span className="text-sm font-medium">
              {formatPrice(item.price * item.quantity)}
            </span>
          </div>
        ))}
      </div>

      {/* 合计 */}
      <div className="bg-white rounded-lg border p-4 mb-6">
        <div className="flex items-center justify-between">
          <span className="text-gray-600">
            共 {order.items.reduce((s, i) => s + i.quantity, 0)} 件商品
          </span>
          <span className="text-2xl font-bold text-red-600">
            {formatPrice(order.total)}
          </span>
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="flex gap-3">
        {order.status === "pending" && (
          <button
            onClick={() => updateStatus("paid")}
            disabled={actionLoading === "paid"}
            className="flex-1 py-2.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {actionLoading === "paid" ? "处理中..." : "模拟支付"}
          </button>
        )}

        {order.status !== "cancelled" && order.status !== "completed" && (
          <button
            onClick={() => updateStatus("cancelled")}
            disabled={actionLoading === "cancelled"}
            className="flex-1 py-2.5 border border-gray-300 text-gray-600 text-sm rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            {actionLoading === "cancelled" ? "处理中..." : "取消订单"}
          </button>
        )}
      </div>

      <div className="mt-6 text-center">
        <Link href="/orders" className="text-sm text-blue-600 hover:text-blue-800">
          ← 返回订单列表
        </Link>
      </div>
    </div>
  );
}
