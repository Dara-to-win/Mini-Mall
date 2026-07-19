/**
 * 后台商品管理 — 表格列表 + 新增/编辑表单
 */
"use client";

import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/utils";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string | null;
  stock: number;
  categoryId: number;
  category: { id: number; name: string } | null;
}

interface Category {
  id: number;
  name: string;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // 表单字段
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState("");
  const [stock, setStock] = useState("0");
  const [categoryId, setCategoryId] = useState("");

  async function loadData() {
    const [pRes, cRes] = await Promise.all([
      fetch("/api/admin/products"),
      fetch("/api/categories"),
    ]);
    const pData = await pRes.json();
    const cData = await cRes.json();
    if (Array.isArray(pData)) setProducts(pData);
    if (Array.isArray(cData)) setCategories(cData);
    setLoading(false);
  }

  useEffect(() => { loadData(); }, []);

  function openCreate() {
    setEditingId(null);
    setName(""); setDescription(""); setPrice("");
    setImage(""); setStock("0"); setCategoryId("");
    setShowForm(true);
  }

  function openEdit(p: Product) {
    setEditingId(p.id);
    setName(p.name); setDescription(p.description); setPrice(String(p.price));
    setImage(p.image || ""); setStock(String(p.stock)); setCategoryId(String(p.categoryId));
    setShowForm(true);
  }

  async function handleSave() {
    setSaving(true); setError("");
    const body = {
      name, description, price, image: image || null, stock: parseInt(stock), categoryId: parseInt(categoryId),
    };

    const url = editingId ? `/api/admin/products/${editingId}` : "/api/admin/products";
    const method = editingId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();

    if (res.ok) {
      setShowForm(false);
      loadData();
    } else {
      setError(data.error || "保存失败");
    }
    setSaving(false);
  }

  async function handleDelete(id: number) {
    if (!confirm("确定删除该商品？")) return;
    const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    if (res.ok) loadData();
  }

  if (loading) return <div className="text-center py-16 text-gray-400">加载中...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">商品管理</h1>
        <button onClick={openCreate} className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
          新增商品
        </button>
      </div>

      {/* 表单弹窗 */}
      {showForm && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold mb-4">{editingId ? "编辑商品" : "新增商品"}</h2>
            {error && <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded mb-3">{error}</div>}
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-700 mb-1">名称 *</label>
                <input value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 border rounded text-sm" />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">描述 *</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full px-3 py-2 border rounded text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">价格 *</label>
                  <input type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} className="w-full px-3 py-2 border rounded text-sm" />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">库存</label>
                  <input type="number" value={stock} onChange={e => setStock(e.target.value)} className="w-full px-3 py-2 border rounded text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">分类 *</label>
                <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className="w-full px-3 py-2 border rounded text-sm">
                  <option value="">选择分类</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">图片 URL</label>
                <input value={image} onChange={e => setImage(e.target.value)} placeholder="https://..." className="w-full px-3 py-2 border rounded text-sm" />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={handleSave} disabled={saving} className="flex-1 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50">
                {saving ? "保存中..." : "保存"}
              </button>
              <button onClick={() => setShowForm(false)} className="flex-1 py-2 border text-gray-600 text-sm rounded hover:bg-gray-50">取消</button>
            </div>
          </div>
        </div>
      )}

      {/* 商品表格 */}
      <div className="bg-white rounded-lg border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
              <th className="text-left px-4 py-2">ID</th>
              <th className="text-left px-4 py-2 w-14">图片</th>
              <th className="text-left px-4 py-2">名称</th>
              <th className="text-left px-4 py-2">分类</th>
              <th className="text-right px-4 py-2">价格</th>
              <th className="text-right px-4 py-2">库存</th>
              <th className="text-center px-4 py-2">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {products.map(p => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 text-gray-400">{p.id}</td>
                <td className="px-4 py-2">
                  {p.image ? (
                    <img src={p.image} alt={p.name} className="w-10 h-10 rounded object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center text-gray-300 text-xs">无图</div>
                  )}
                </td>
                <td className="px-4 py-2 font-medium">{p.name}</td>
                <td className="px-4 py-2 text-gray-500">{p.category?.name}</td>
                <td className="px-4 py-2 text-right text-red-600">{formatPrice(p.price)}</td>
                <td className="px-4 py-2 text-right">{p.stock}</td>
                <td className="px-4 py-2 text-center">
                  <button onClick={() => openEdit(p)} className="text-blue-600 hover:underline mr-2">编辑</button>
                  <button onClick={() => handleDelete(p.id)} className="text-red-500 hover:underline">删除</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
