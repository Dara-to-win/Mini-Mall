/**
 * 后台分类管理 — 列表 + 新增表单
 */
"use client";

import { useEffect, useState } from "react";

interface Category {
  id: number;
  name: string;
  slug: string;
  _count: { products: number };
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function loadCategories() {
    const res = await fetch("/api/admin/categories");
    const data = await res.json();
    if (Array.isArray(data)) setCategories(data);
    setLoading(false);
  }

  useEffect(() => { loadCategories(); }, []);

  /** 从名称自动生成 slug */
  function handleNameChange(v: string) {
    setName(v);
    // 仅在新创建时自动生成
    if (!showForm || !name) {
      setSlug(v.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""));
    }
  }

  async function handleCreate() {
    if (!name || !slug) { setError("请填写名称和标识"); return; }
    setSaving(true); setError("");
    const res = await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, slug }),
    });
    const data = await res.json();
    if (res.ok) {
      setName(""); setSlug(""); setShowForm(false);
      loadCategories();
    } else {
      setError(data.error || "创建失败");
    }
    setSaving(false);
  }

  async function handleDelete(id: number) {
    if (!confirm("确定删除该分类？")) return;
    const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
    if (res.ok) {
      loadCategories();
    } else {
      const data = await res.json();
      alert(data.error || "删除失败");
    }
  }

  if (loading) return <div className="text-center py-16 text-gray-400">加载中...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">分类管理</h1>
        <button onClick={() => setShowForm(!showForm)} className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
          新增分类
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg border p-4 mb-4">
          <h2 className="text-sm font-medium mb-3">新增分类</h2>
          {error && <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded mb-3">{error}</div>}
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="block text-sm text-gray-700 mb-1">名称</label>
              <input value={name} onChange={e => handleNameChange(e.target.value)} placeholder="如：手机数码" className="w-full px-3 py-2 border rounded text-sm" />
            </div>
            <div className="flex-1">
              <label className="block text-sm text-gray-700 mb-1">标识 (slug)</label>
              <input value={slug} onChange={e => setSlug(e.target.value)} placeholder="如：phone-digital" className="w-full px-3 py-2 border rounded text-sm" />
            </div>
            <button onClick={handleCreate} disabled={saving} className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50 shrink-0">
              {saving ? "创建中..." : "创建"}
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
              <th className="text-left px-4 py-2">ID</th>
              <th className="text-left px-4 py-2">名称</th>
              <th className="text-left px-4 py-2">标识</th>
              <th className="text-right px-4 py-2">商品数量</th>
              <th className="text-center px-4 py-2">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {categories.map(c => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 text-gray-400">{c.id}</td>
                <td className="px-4 py-2 font-medium">{c.name}</td>
                <td className="px-4 py-2 text-gray-500 font-mono text-xs">{c.slug}</td>
                <td className="px-4 py-2 text-right">{c._count.products}</td>
                <td className="px-4 py-2 text-center">
                  <button onClick={() => handleDelete(c.id)} disabled={c._count.products > 0} className="text-red-500 hover:underline disabled:opacity-30 disabled:no-underline text-xs">
                    删除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
