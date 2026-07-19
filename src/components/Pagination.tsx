/**
 * 分页组件 — 从 URL searchParams 保留当前筛选条件
 */
"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function Pagination({
  currentPage,
  totalPages,
}: {
  currentPage: number;
  totalPages: number;
}) {
  const searchParams = useSearchParams();

  function buildHref(page: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    const query = params.toString();
    return `/?${query}`;
  }

  // 生成页码数组，最多显示 7 页
  const pages: (number | "...")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push("...");
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
  }

  return (
    <div className="flex justify-center items-center gap-1 mt-8">
      {currentPage > 1 && (
        <Link
          href={buildHref(currentPage - 1)}
          className="px-3 py-1.5 text-sm border border-gray-200 rounded hover:bg-gray-100"
        >
          上一页
        </Link>
      )}

      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`dots-${i}`} className="px-2 py-1 text-gray-400">
            ...
          </span>
        ) : (
          <Link
            key={p}
            href={buildHref(p)}
            className={`px-3 py-1.5 text-sm border rounded ${
              p === currentPage
                ? "bg-blue-600 text-white border-blue-600"
                : "border-gray-200 hover:bg-gray-100"
            }`}
          >
            {p}
          </Link>
        )
      )}

      {currentPage < totalPages && (
        <Link
          href={buildHref(currentPage + 1)}
          className="px-3 py-1.5 text-sm border border-gray-200 rounded hover:bg-gray-100"
        >
          下一页
        </Link>
      )}
    </div>
  );
}
