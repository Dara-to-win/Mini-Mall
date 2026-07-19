/**
 * 结算页面 — 确认购物车商品并创建订单
 */
"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";

interface CartItem {
  id: number;
  productId: number;
  name: string;
  image: string | null;
  price: number;
  stock: number;
  quantity: number;
  subtotal: number;
}

export default function CheckoutPage() {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const loadCart = useCallback(async () => {
    try {
      const res = await fetch("/api/cart");
      if (res.status === 401) {
        router.push("/login?redirect=/checkout");
        return;
      }
      const data = await res.json();
      if (res.ok) {
        setItems(data.items);
        if (data.items.length === 0) {
          router.push("/cart");
        }
      }
    } catch {
      setError("网络错误");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  async function handleSubmit() {
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/orders", { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        if (data.details) {
          setError(data.details.join("；"));
        } else {
          setError(data.error || "创建订单失败");
        }
        return;
      }

      // 下单成功，跳转订单详情
      router.push(`/orders/${data.id}`);
    } catch {
      setError("网络错误，请稍后重试");
    } finally {
      setSubmitting(false);
    }
  }

  const total = items.reduce((sum, item) => sum + item.subtotal, 0);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center text-gray-400">
        加载中...
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">确认订单</h1>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded mb-4">
          {error}
          <button onClick={() => setError("")} className="ml-2 underline">
            关闭
          </button>
        </div>
      )}

      {/* 商品列表（只读） */}
      <div className="bg-white rounded-lg border divide-y">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-3 p-3">
            <div className="w-14 h-14 rounded bg-gray-100 shrink-0 overflow-hidden">
              {item.image ? (
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">无图</div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900 line-clamp-1">{item.name}</p>
              <p className="text-xs text-gray-500">
                {formatPrice(item.price)} × {item.quantity}
              </p>
            </div>
            <span className="text-sm font-medium text-red-600">
              {formatPrice(item.subtotal)}
            </span>
          </div>
        ))}
      </div>

      {/* 总价和操作 */}
      <div className="mt-6 bg-white rounded-lg p-4 border">
        <div className="flex items-center justify-between mb-4">
          <span className="text-gray-600">
            共 {items.length} 件商品
          </span>
          <span className="text-xl font-bold text-red-600">
            合计：{formatPrice(total)}
          </span>
        </div>

        <div className="flex gap-3">
          <Link
            href="/cart"
            className="flex-1 py-2.5 border border-gray-300 text-gray-600 text-sm text-center rounded-lg hover:bg-gray-50"
          >
            返回修改
          </Link>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 py-2.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {submitting ? "提交中..." : "确认下单"}
          </button>
        </div>

        <p className="text-xs text-gray-400 mt-3 text-center">
          点击确认下单即表示模拟支付成功，无需真实付款
        </p>
      </div>
    </div>
  );
}
