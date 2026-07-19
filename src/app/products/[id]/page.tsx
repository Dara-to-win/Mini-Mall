/**
 * 商品详情页 — 大图 + 名称/价格/描述/库存 + 加入购物车按钮
 */
import { prisma } from "@/lib/prisma";
import { parseProductId, formatPrice } from "@/lib/utils";
import Link from "next/link";
import { notFound } from "next/navigation";
import AddToCartButton from "@/components/AddToCartButton";

export default async function ProductDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const productId = parseProductId(id);

  if (productId === null) notFound();

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { category: true },
  });

  if (!product) notFound();

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* 面包屑 */}
      <nav className="text-sm text-gray-500 mb-4">
        <Link href="/" className="hover:text-blue-600">
          首页
        </Link>
        <span className="mx-2">/</span>
        <Link
          href={`/?category=${encodeURIComponent(product.category.slug)}`}
          className="hover:text-blue-600"
        >
          {product.category.name}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white rounded-lg p-6 shadow-sm">
        {/* 商品大图 */}
        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-lg">
              暂无图片
            </div>
          )}
        </div>

        {/* 商品信息 */}
        <div className="flex flex-col gap-4">
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded self-start">
            {product.category.name}
          </span>

          <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>

          <div className="text-3xl font-bold text-red-600">
            {formatPrice(product.price)}
          </div>

          <div className="text-sm text-gray-500">
            库存：
            {product.stock > 0 ? (
              <span className="text-green-600 font-medium">{product.stock} 件现货</span>
            ) : (
              <span className="text-red-500 font-medium">暂时缺货</span>
            )}
          </div>

          <div className="border-t pt-4">
            <h3 className="text-sm font-medium text-gray-900 mb-2">商品描述</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              {product.description}
            </p>
          </div>

          <div className="mt-auto pt-4">
            <AddToCartButton
              productId={product.id}
              productName={product.name}
              disabled={product.stock === 0}
            />
          </div>
        </div>
      </div>

      {/* 返回首页 */}
      <div className="mt-6 text-center">
        <Link href="/" className="text-sm text-blue-600 hover:text-blue-800">
          ← 返回商品列表
        </Link>
      </div>
    </div>
  );
}
