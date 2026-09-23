// app/api/categories/route.ts
// Endpoint publik (hanya butuh login) untuk ambil daftar kategori
// Dipakai form tambah & edit transaksi

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const categories = await prisma.category.findMany({
    orderBy: { nama: "asc" },
  });

  return NextResponse.json(categories);
}
