/**
 * 购物车页面 — 需登录，受 middleware 保护
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

export default function CartPage() {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /** 加载购物车数据 */
  const loadCart = useCallback(async () => {
    try {
      const res = await fetch("/api/cart");
      if (res.status === 401) {
        router.push("/login?redirect=/cart");
        return;
      }
      const data = await res.json();
      if (res.ok) {
        setItems(data.items);
      } else {
        setError(data.error || "加载失败");
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

  /** 修改数量 */
  async function updateQuantity(cartItemId: number, quantity: number) {
    const res = await fetch(`/api/cart/${cartItemId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity }),
    });

    if (res.ok) {
      loadCart();
    } else {
      const data = await res.json();
      setError(data.error || "操作失败");
      loadCart(); // 刷新以恢复正确状态
    }
  }

  /** 删除项 */
  async function removeItem(cartItemId: number) {
    const res = await fetch(`/api/cart/${cartItemId}`, {
      method: "DELETE",
    });

    if (res.ok) {
      loadCart();
    } else {
      const data = await res.json();
      setError(data.error || "删除失败");
    }
  }

  const total = items.reduce((sum, item) => sum + item.subtotal, 0);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center text-gray-400">
        加载中...
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">购物车</h1>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded mb-4">
          {error}
          <button onClick={() => setError("")} className="ml-2 underline">
            关闭
          </button>
        </div>
      )}

      {items.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg">购物车是空的</p>
          <Link
            href="/"
            className="text-sm text-blue-600 hover:text-blue-800 mt-2 inline-block"
          >
            去逛逛
          </Link>
        </div>
      ) : (
        <>
          {/* 列表头 */}
          <div className="hidden sm:grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 text-xs text-gray-500 pb-2 border-b mb-2">
            <span>商品</span>
            <span className="text-center">单价</span>
            <span className="text-center">数量</span>
            <span className="text-right">小计</span>
            <span />
          </div>

          {/* 购物车列表 */}
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-[auto_1fr] sm:grid-cols-[2fr_1fr_1fr_1fr_auto] gap-3 items-center bg-white p-3 rounded-lg border"
              >
                {/* 商品信息 */}
                <Link
                  href={`/products/${item.productId}`}
                  className="flex items-center gap-3 min-w-0"
                >
                  <div className="w-16 h-16 rounded bg-gray-100 shrink-0 overflow-hidden">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                        无图
                      </div>
                    )}
                  </div>
                  <span className="text-sm text-gray-900 line-clamp-2">
                    {item.name}
                  </span>
                </Link>

                {/* 单价 */}
                <span className="text-sm text-gray-900 text-center">
                  {formatPrice(item.price)}
                </span>

                {/* 数量控制 */}
                <div className="flex items-center justify-center gap-1">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                    className="w-7 h-7 border rounded text-sm flex items-center justify-center hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    −
                  </button>
                  <span className="w-8 text-center text-sm">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    disabled={item.quantity >= item.stock}
                    className="w-7 h-7 border rounded text-sm flex items-center justify-center hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    +
                  </button>
                </div>

                {/* 小计 */}
                <span className="text-sm font-medium text-red-600 text-right">
                  {formatPrice(item.subtotal)}
                </span>

                {/* 删除 */}
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-xs text-gray-400 hover:text-red-600 justify-self-end sm:justify-self-auto"
                >
                  删除
                </button>
              </div>
            ))}
          </div>

          {/* 底部总价和提交 */}
          <div className="mt-6 bg-white rounded-lg p-4 border flex items-center justify-between">
            <span className="text-sm text-gray-600">
              共 {items.length} 件商品
            </span>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">合计：</span>
              <span className="text-xl font-bold text-red-600">
                {formatPrice(total)}
              </span>
              <button
                onClick={() => router.push("/checkout")}
                className="px-6 py-2.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
              >
                提交订单
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
