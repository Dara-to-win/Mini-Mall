/**
 * 后台订单管理 — 表格列表 + 状态流转按钮
 */
"use client";

import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/utils";

interface Order {
  id: number;
  status: string;
  total: number;
  createdAt: string;
  user: { id: number; name: string; email: string };
  items: { quantity: number; product: { name: string } }[];
}

const STATUS_LABELS: Record<string, string> = {
  pending: "待付款", paid: "已支付", shipped: "已发货",
  completed: "已完成", cancelled: "已取消",
};

const STATUS_CLASS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  paid: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-gray-100 text-gray-500",
};

/** 每个状态允许的下一步操作 */
const NEXT_ACTIONS: Record<string, { label: string; status: string; className: string }[]> = {
  pending: [
    { label: "设为已支付", status: "paid", className: "bg-blue-600 hover:bg-blue-700" },
    { label: "取消", status: "cancelled", className: "bg-red-500 hover:bg-red-600" },
  ],
  paid: [
    { label: "设为已发货", status: "shipped", className: "bg-purple-600 hover:bg-purple-700" },
    { label: "取消", status: "cancelled", className: "bg-red-500 hover:bg-red-600" },
  ],
  shipped: [
    { label: "设为已完成", status: "completed", className: "bg-green-600 hover:bg-green-700" },
    { label: "取消", status: "cancelled", className: "bg-red-500 hover:bg-red-600" },
  ],
  completed: [],
  cancelled: [],
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadOrders() {
    const res = await fetch("/api/admin/orders");
    const data = await res.json();
    if (Array.isArray(data)) setOrders(data);
    setLoading(false);
  }

  useEffect(() => { loadOrders(); }, []);

  async function updateStatus(orderId: number, status: string) {
    await fetch(`/api/admin/orders/${orderId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    loadOrders();
  }

  if (loading) return <div className="text-center py-16 text-gray-400">加载中...</div>;

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">订单管理</h1>
      <div className="bg-white rounded-lg border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
              <th className="text-left px-4 py-2">订单号</th>
              <th className="text-left px-4 py-2">用户</th>
              <th className="text-left px-4 py-2">商品</th>
              <th className="text-right px-4 py-2">金额</th>
              <th className="text-center px-4 py-2">状态</th>
              <th className="text-left px-4 py-2">时间</th>
              <th className="text-center px-4 py-2">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {orders.map(o => (
              <tr key={o.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 font-medium">#{o.id}</td>
                <td className="px-4 py-2 text-gray-500">{o.user.name}</td>
                <td className="px-4 py-2 text-gray-500">
                  {o.items.map(i => `${i.product.name}×${i.quantity}`).join("、")}
                </td>
                <td className="px-4 py-2 text-right text-red-600 font-medium">{formatPrice(o.total)}</td>
                <td className="px-4 py-2 text-center">
                  <span className={`text-xs px-2 py-0.5 rounded ${STATUS_CLASS[o.status]}`}>
                    {STATUS_LABELS[o.status]}
                  </span>
                </td>
                <td className="px-4 py-2 text-gray-400 text-xs">
                  {new Date(o.createdAt).toLocaleString("zh-CN")}
                </td>
                <td className="px-4 py-2">
                  <div className="flex gap-1">
                    {(NEXT_ACTIONS[o.status] || []).map(a => (
                      <button
                        key={a.status}
                        onClick={() => updateStatus(o.id, a.status)}
                        className={`text-xs text-white px-2 py-1 rounded ${a.className}`}
                      >
                        {a.label}
                      </button>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
