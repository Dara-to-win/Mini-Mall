/**
 * 种子数据脚本 — 初始化分类和商品数据
 * 运行方式：npx tsx prisma/seed.ts
 */
import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

// LibSQL 适配器连接 SQLite
const adapter = new PrismaLibSql({ url: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  // 清理旧数据
  await prisma.cartItem.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  console.log("已清理旧数据");

  // 创建分类
  const categories = await Promise.all([
    prisma.category.create({ data: { name: "手机数码", slug: "phone-digital" } }),
    prisma.category.create({ data: { name: "电脑办公", slug: "computer-office" } }),
    prisma.category.create({ data: { name: "家用电器", slug: "home-appliance" } }),
    prisma.category.create({ data: { name: "服装鞋帽", slug: "clothing" } }),
    prisma.category.create({ data: { name: "食品生鲜", slug: "food" } }),
  ]);

  console.log(`已创建 ${categories.length} 个分类`);

  // 创建商品
  const products = [
    // 手机数码
    { name: "iPhone 16 Pro Max", description: "苹果最新旗舰手机，A18 Pro 芯片，4800 万像素三摄系统，钛金属边框设计。支持 5G 网络，电池续航大幅提升。", price: 9999, stock: 50, categoryId: categories[0].id, image: "https://picsum.photos/seed/iphone16/400/400" },
    { name: "华为 Mate 70 Pro", description: "华为旗舰手机，麒麟 9100 芯片，卫星通信，XMAGE 影像系统。搭载 HarmonyOS NEXT 操作系统。", price: 8999, stock: 30, categoryId: categories[0].id, image: "https://picsum.photos/seed/huawei70/400/400" },
    { name: "小米 15 Ultra", description: "徕卡光学镜头，骁龙 8 Gen 4 处理器，120W 超级快充。2K 超清屏幕，IP68 防水防尘。", price: 5999, stock: 80, categoryId: categories[0].id, image: "https://picsum.photos/seed/mi15/400/400" },
    { name: "Apple Watch Ultra 3", description: "极限运动智能手表，100 米防水，双频 GPS，LTPO 常亮屏幕。电池续航 72 小时。", price: 6499, stock: 25, categoryId: categories[0].id, image: "https://picsum.photos/seed/watchu3/400/400" },

    // 电脑办公
    { name: "MacBook Pro 16 M4", description: "Apple M4 Pro 芯片，32GB 统一内存，1TB SSD。Liquid Retina XDR 显示屏，18 小时电池续航。", price: 19999, stock: 20, categoryId: categories[1].id, image: "https://picsum.photos/seed/macbook16/400/400" },
    { name: "ThinkPad X1 Carbon", description: "联想商务旗舰笔记本，Intel Ultra 9 处理器，14 英寸 2.8K OLED 屏，重量仅 1.08kg。", price: 12999, stock: 15, categoryId: categories[1].id, image: "https://picsum.photos/seed/thinkpad/400/400" },
    { name: "iPad Pro M4 13寸", description: "M4 芯片，Mini LED 显示屏，Apple Pencil Pro 支持。轻薄便携，性能强劲。", price: 8999, stock: 40, categoryId: categories[1].id, image: "https://picsum.photos/seed/ipadpro/400/400" },
    { name: "机械革命 旷世 X", description: "RTX 4090 独显，i9-14900HX 处理器，32GB DDR5，17.3 英寸 240Hz 电竞屏。", price: 14999, stock: 10, categoryId: categories[1].id, image: "https://picsum.photos/seed/gaming/400/400" },

    // 家用电器
    { name: "戴森 V16 无绳吸尘器", description: "激光探测微尘，智能调节吸力，续航 60 分钟。LCD 显示屏实时显示清洁数据。", price: 4990, stock: 35, categoryId: categories[2].id, image: "https://picsum.photos/seed/dysonv16/400/400" },
    { name: "小米空气净化器 4 Pro", description: "CADR 值 500m³/h，适用面积 60㎡，OLED 触控屏，支持米家 APP 远程控制。", price: 1999, stock: 60, categoryId: categories[2].id, image: "https://picsum.photos/seed/airpurifier/400/400" },
    { name: "格力 变频空调 1.5匹", description: "新一级能效，变频冷暖，自清洁技术，18 分贝静音运行。WiFi 智能控制。", price: 3299, stock: 45, categoryId: categories[2].id, image: "https://picsum.photos/seed/greeac/400/400" },
    { name: "石头 G30 扫地机器人", description: "7000Pa 吸力，全能基站自清洁，AI 避障 3.0，LDS 激光导航。拖布自动抬升。", price: 4299, stock: 30, categoryId: categories[2].id, image: "https://picsum.photos/seed/robot/400/400" },

    // 服装鞋帽
    { name: "Nike Air Max 270", description: "经典气垫跑鞋，React 泡棉中底，网面透气鞋面。日常通勤和运动穿搭首选。", price: 1099, stock: 100, categoryId: categories[3].id, image: "https://picsum.photos/seed/nike270/400/400" },
    { name: "优衣库 轻薄羽绒服", description: "90% 白鹅绒填充，蓬松度 750+，可收纳设计便于携带。防风防泼水面料。", price: 599, stock: 80, categoryId: categories[3].id, image: "https://picsum.photos/seed/uniqlo/400/400" },
    { name: "Levi's 501 经典牛仔裤", description: "经典直筒版型，全棉丹宁面料，做旧水洗工艺。170 年经典传承。", price: 799, stock: 70, categoryId: categories[3].id, image: "https://picsum.photos/seed/levis501/400/400" },

    // 食品生鲜
    { name: "智利车厘子 JJ级 5斤装", description: "当季新鲜采摘，果径 28-30mm，甜度 18°以上。全程冷链运输，新鲜直达。", price: 299, stock: 200, categoryId: categories[4].id, image: "https://picsum.photos/seed/cherry/400/400" },
    { name: "三只松鼠 坚果大礼包", description: "精选 6 种坚果组合，每日坚果科学配比。包装精美，送礼自用两相宜。", price: 168, stock: 150, categoryId: categories[4].id, image: "https://picsum.photos/seed/nuts/400/400" },
    { name: "阳澄湖大闸蟹 礼盒装", description: "每只 3.5 两以上，黄满膏肥，肉质鲜甜。顺丰冷链直达，死蟹包赔。", price: 399, stock: 50, categoryId: categories[4].id, image: "https://picsum.photos/seed/crab/400/400" },
  ];

  for (const product of products) {
    await prisma.product.create({ data: product });
  }

  console.log(`已创建 ${products.length} 个商品`);
  console.log("种子数据初始化完成！");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
