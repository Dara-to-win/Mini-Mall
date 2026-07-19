/**
 * GET /api/admin/categories — 分类列表
 * POST /api/admin/categories — 新增分类
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-guard";

export async function GET() {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  try {
    const categories = await prisma.category.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json(categories);
  } catch (error) {
    console.error("获取分类列表失败:", error);
    return NextResponse.json({ error: "获取分类列表失败" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  try {
    const { name, slug } = await request.json();

    if (!name || !slug) {
      return NextResponse.json({ error: "名称和标识为必填项" }, { status: 400 });
    }

    // slug 格式校验
    if (!/^[a-z0-9-]+$/.test(slug)) {
      return NextResponse.json(
        { error: "标识只能包含小写字母、数字和连字符" },
        { status: 400 }
      );
    }

    // 唯一性检查
    const existing = await prisma.category.findFirst({
      where: { OR: [{ name }, { slug }] },
    });
    if (existing) {
      return NextResponse.json(
        { error: existing.name === name ? "分类名称已存在" : "分类标识已存在" },
        { status: 409 }
      );
    }

    const category = await prisma.category.create({
      data: { name, slug },
      include: { _count: { select: { products: true } } },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error("创建分类失败:", error);
    return NextResponse.json({ error: "创建分类失败" }, { status: 500 });
  }
}
