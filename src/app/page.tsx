/**
 * 首页 — 商品网格 + 搜索框 + 分类标签切换 + 分页
 * 使用 Server Component 直接查询数据库
 */
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { parsePage, buildProductWhereClause, PAGE_SIZE } from "@/lib/utils";
import ProductCard from "@/components/ProductCard";
import SearchBar from "@/components/SearchBar";
import CategoryTabs from "@/components/CategoryTabs";
import Pagination from "@/components/Pagination";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; category?: string; page?: string }>;
}) {
  const params = await searchParams;
  const search = params.search || "";
  const categorySlug = params.category || "";
  const page = parsePage(params.page);

  // 构建查询条件
  const where = buildProductWhereClause(search, categorySlug);

  // 并行查询：分类列表 + 商品总数 + 当前页商品
  const [categories, total, products] = await Promise.all([
    prisma.category.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { createdAt: "asc" },
    }),
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      include: { category: true },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* 搜索框 */}
      <Suspense fallback={<div className="h-12 bg-gray-100 rounded-lg animate-pulse" />}>
        <SearchBar defaultValue={search} />
      </Suspense>

      {/* 分类标签 */}
      <Suspense fallback={<div className="flex gap-2 mt-4"><div className="h-8 w-16 bg-gray-100 rounded-full" /></div>}>
        <CategoryTabs
          categories={categories}
          activeSlug={categorySlug}
        />
      </Suspense>

      {/* 商品网格 */}
      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              price={product.price}
              image={product.image}
              stock={product.stock}
              categoryName={product.category.name}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg">暂无商品</p>
          <p className="text-sm mt-2">换个搜索关键词或分类试试</p>
        </div>
      )}

      {/* 分页 */}
      {totalPages > 1 && (
        <Suspense fallback={<div className="h-10 bg-gray-100 rounded mt-8 animate-pulse" />}>
          <Pagination
            currentPage={page}
            totalPages={totalPages}
          />
        </Suspense>
      )}
    </div>
  );
}
