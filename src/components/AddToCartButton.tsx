/**
 * 加入购物车按钮 — 客户端交互，接入购物车 API
 */
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function AddToCartButton({
  productId,
  productName,
  disabled,
}: {
  productId: number;
  productName: string;
  disabled: boolean;
}) {
  const router = useRouter();
  const [added, setAdded] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 组件卸载时清理定时器
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  async function handleAdd() {
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity: 1 }),
      });

      if (res.status === 401) {
        router.push("/login?redirect=" + encodeURIComponent(window.location.pathname));
        return;
      }

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "加入购物车失败");
        return;
      }

      // 成功
      setAdded(true);
      timerRef.current = setTimeout(() => setAdded(false), 2000);
      router.refresh(); // 刷新 Header 中的购物车（如有）
    } catch {
      setError("网络错误，请稍后重试");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        onClick={handleAdd}
        disabled={disabled || loading}
        className={`w-full py-3 rounded-lg text-sm font-medium transition-colors ${
          disabled
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : added
              ? "bg-green-600 text-white"
              : "bg-blue-600 text-white hover:bg-blue-700"
        }`}
      >
        {disabled
          ? "已售罄"
          : loading
            ? "添加中..."
            : added
              ? "已加入购物车 ✓"
              : "加入购物车"}
      </button>
      {error && (
        <p className="text-red-500 text-xs mt-1">{error}</p>
      )}
    </div>
  );
}
