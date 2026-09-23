// lib/prisma.ts
// Setup Prisma 7 dengan driver adapter pg (untuk PostgreSQL lokal).
// Prisma 7 TIDAK load .env otomatis saat runtime, jadi DATABASE_URL
// harus sudah ada di process.env sebelum file ini dijalankan.
// Next.js App Router membaca .env.local secara otomatis, jadi aman.

import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Singleton pattern agar tidak ada multiple connections di development (hot reload)
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
  });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
