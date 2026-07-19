/**
 * 搜索框 — 支持按关键词搜索商品，输入状态与 URL 同步
 */
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";

export default function SearchBar({ defaultValue = "" }: { defaultValue?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(defaultValue);
  const prevDefaultRef = useRef(defaultValue);

  // 当外部 URL 变化时（浏览器前进后退），同步输入框状态
  useEffect(() => {
    if (prevDefaultRef.current !== defaultValue) {
      setValue(defaultValue);
      prevDefaultRef.current = defaultValue;
    }
  }, [defaultValue]);

  function handleSearch() {
    const params = new URLSearchParams(searchParams.toString());
    if (value.trim()) {
      params.set("search", value.trim());
    } else {
      params.delete("search");
    }
    params.delete("page"); // 搜索时重置分页
    const query = params.toString();
    router.push(query ? `/?${query}` : "/");
  }

  return (
    <div className="flex gap-2">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        placeholder="搜索商品名称或描述..."
        className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      <button
        onClick={handleSearch}
        className="px-5 py-2.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors shrink-0"
      >
        搜索
      </button>
    </div>
  );
}
