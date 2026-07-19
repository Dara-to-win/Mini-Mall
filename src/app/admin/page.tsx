/**
 * 管理后台首页 — 概览
 */
import { prisma } from "@/lib/prisma";

export default async function AdminDashboard() {
  const [productCount, orderCount, userCount] = await Promise.all([
    prisma.product.count(),
    prisma.order.count(),
    prisma.user.count(),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">管理后台</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border p-6">
          <p className="text-sm text-gray-500">商品总数</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">{productCount}</p>
        </div>
        <div className="bg-white rounded-lg border p-6">
          <p className="text-sm text-gray-500">订单总数</p>
          <p className="text-3xl font-bold text-green-600 mt-2">{orderCount}</p>
        </div>
        <div className="bg-white rounded-lg border p-6">
          <p className="text-sm text-gray-500">用户总数</p>
          <p className="text-3xl font-bold text-purple-600 mt-2">{userCount}</p>
        </div>
      </div>
    </div>
  );
}
