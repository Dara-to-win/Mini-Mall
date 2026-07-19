/**
 * 全局页头 — 导航栏 + 用户入口
 * Server Component，读取当前用户登录状态
 */
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import LogoutButton from "@/components/LogoutButton";

export default async function Header() {
  const user = await getCurrentUser();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold text-blue-600 shrink-0">
          Mini Mall
        </Link>

        {/* 导航链接 */}
        <nav className="hidden sm:flex items-center gap-6 text-sm">
          <Link href="/" className="text-gray-700 hover:text-blue-600 transition-colors">
            首页
          </Link>
          <Link href="/cart" className="text-gray-700 hover:text-blue-600 transition-colors">
            购物车
          </Link>
          <Link href="/orders" className="text-gray-700 hover:text-blue-600 transition-colors">
            我的订单
          </Link>
        </nav>

        {/* 用户入口 */}
        <div className="flex items-center gap-3 text-sm">
          {user ? (
            <>
              <span className="text-gray-700">
                {user.name}
                {user.role === "admin" && (
                  <Link
                    href="/admin"
                    className="ml-2 text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded"
                  >
                    管理后台
                  </Link>
                )}
              </span>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link href="/login" className="text-gray-600 hover:text-blue-600">
                登录
              </Link>
              <Link
                href="/register"
                className="bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 transition-colors"
              >
                注册
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
