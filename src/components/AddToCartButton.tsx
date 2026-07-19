/**
 * 加入购物车按钮 — 客户端交互
 * 当前为占位实现，认证系统完成后接入购物车逻辑
 */
"use client";

import { useState, useEffect, useRef } from "react";

export default function AddToCartButton({
  productId,
  productName,
  disabled,
}: {
  productId: number;
  productName: string;
  disabled: boolean;
}) {
  const [added, setAdded] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 组件卸载时清理定时器
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  function handleAdd() {
    // TODO: 接入购物车 API（认证系统完成后实现）, 届时在此 await API 调用
    setAdded(true);
    timerRef.current = setTimeout(() => setAdded(false), 2000);
  }

  return (
    <button
      onClick={handleAdd}
      disabled={disabled}
      className={`w-full py-3 rounded-lg text-sm font-medium transition-colors ${
        disabled
          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
          : added
            ? "bg-green-600 text-white"
            : "bg-blue-600 text-white hover:bg-blue-700"
      }`}
    >
      {disabled ? "已售罄" : added ? "已加入购物车 ✓" : "加入购物车"}
    </button>
  );
}
