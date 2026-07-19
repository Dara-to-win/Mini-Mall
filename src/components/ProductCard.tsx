/**
 * 商品卡片组件 — 用于首页商品网格展示
 */
import Link from "next/link";
import { formatPrice } from "@/lib/utils";

interface ProductCardProps {
  id: number;
  name: string;
  price: number;
  image: string | null;
  stock: number;
  categoryName: string;
}

export default function ProductCard({
  id,
  name,
  price,
  image,
  stock,
  categoryName,
}: ProductCardProps) {
  return (
    <Link
      href={`/products/${id}`}
      className="group rounded-lg border border-gray-200 bg-white overflow-hidden hover:shadow-md transition-shadow"
    >
      <div className="aspect-square bg-gray-100 relative overflow-hidden">
        {image ? (
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            暂无图片
          </div>
        )}
        {stock === 0 && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white text-lg font-bold">已售罄</span>
          </div>
        )}
      </div>
      <div className="p-3">
        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
          {categoryName}
        </span>
        <h3 className="mt-2 text-sm font-medium text-gray-900 line-clamp-2">
          {name}
        </h3>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-lg font-bold text-red-600">
            {formatPrice(price)}
          </span>
          <span className="text-xs text-gray-400">
            {stock > 0 ? `库存 ${stock}` : "已售罄"}
          </span>
        </div>
      </div>
    </Link>
  );
}
