import { PrismaClient } from "@/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/** 确保 DATABASE_URL 已设置，否则给出明确错误信息 */
function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL 环境变量未设置。请在 .env 文件中配置 DATABASE_URL=file:./dev.db"
    );
  }
  return url;
}

const adapter = new PrismaLibSql({ url: getDatabaseUrl() });

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
