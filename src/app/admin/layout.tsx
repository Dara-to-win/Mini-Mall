/**
 * 管理后台布局 — 侧边导航
 */
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    redirect("/login?redirect=/admin");
  }

  const navItems = [
    { href: "/admin", label: "概览" },
    { href: "/admin/products", label: "商品管理" },
    { href: "/admin/orders", label: "订单管理" },
    { href: "/admin/categories", label: "分类管理" },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex gap-6">
        {/* 侧边栏 */}
        <aside className="w-48 shrink-0">
          <nav className="bg-white rounded-lg border p-2 space-y-1 sticky top-20">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block px-3 py-2 text-sm text-gray-700 rounded hover:bg-gray-100 transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        {/* 内容区 */}
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}
