/**
 * 分类标签切换 — 按分类筛选商品
 */
"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface CategoryWithCount {
  id: number;
  name: string;
  slug: string;
  _count: { products: number };
}

export default function CategoryTabs({
  categories,
  activeSlug,
}: {
  categories: CategoryWithCount[];
  activeSlug: string;
}) {
  const searchParams = useSearchParams();

  function buildHref(slug: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (slug) {
      params.set("category", slug);
    } else {
      params.delete("category");
    }
    params.delete("page");
    const query = params.toString();
    return query ? `/?${query}` : "/";
  }

  return (
    <div className="flex flex-wrap gap-2 mt-4">
      {/* 全部 */}
      <Link
        href={buildHref("")}
        className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
          !activeSlug
            ? "bg-blue-600 text-white"
            : "bg-white text-gray-600 border border-gray-200 hover:border-blue-400"
        }`}
      >
        全部
      </Link>

      {categories.map((cat) => (
        <Link
          key={cat.id}
          href={buildHref(cat.slug)}
          className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
            activeSlug === cat.slug
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-600 border border-gray-200 hover:border-blue-400"
          }`}
        >
          {cat.name}
          <span className="ml-1 opacity-70">({cat._count.products})</span>
        </Link>
      ))}
    </div>
  );
}
