import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

function bulanTahunSekarang() {
  const now = new Date();
  return { bulan: now.getMonth() + 1, tahun: now.getFullYear() };
}

// GET /api/budget?bulan=9&tahun=2026 (default: bulan ini)
export async function GET(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const sekarang = bulanTahunSekarang();
  const bulan = Number(searchParams.get("bulan")) || sekarang.bulan;
  const tahun = Number(searchParams.get("tahun")) || sekarang.tahun;

  const awal = new Date(Date.UTC(tahun, bulan - 1, 1));
  const akhir = new Date(Date.UTC(tahun, bulan, 1));

  const [budget, pengeluaran] = await Promise.all([
    prisma.budget.findUnique({
      where: { userId_bulan_tahun: { userId: user.id, bulan, tahun } },
    }),
    prisma.transaction.aggregate({
      _sum: { jumlah: true },
      where: {
        userId: user.id,
        jenis: "pengeluaran",
        tanggal: { gte: awal, lt: akhir },
      },
    }),
  ]);

  const totalAnggaran = budget ? Number(budget.jumlah) : 0;
  const totalPengeluaran = Number(pengeluaran._sum.jumlah ?? 0);

  return NextResponse.json({
    bulan,
    tahun,
    sudahDiatur: !!budget,
    totalAnggaran,
    totalPengeluaran,
    sisaAnggaran: totalAnggaran - totalPengeluaran,
  });
}

// PUT /api/budget  body: { jumlah, bulan?, tahun? }
export async function PUT(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const jumlah = Number(body?.jumlah);

  if (!Number.isFinite(jumlah) || jumlah <= 0 || jumlah > 1e12) {
    return NextResponse.json(
      { message: "Jumlah anggaran tidak valid" },
      { status: 400 }
    );
  }

  const sekarang = bulanTahunSekarang();
  const bulan = Number(body?.bulan) || sekarang.bulan;
  const tahun = Number(body?.tahun) || sekarang.tahun;

  const budget = await prisma.budget.upsert({
    where: { userId_bulan_tahun: { userId: user.id, bulan, tahun } },
    update: { jumlah },
    create: { userId: user.id, bulan, tahun, jumlah },
  });

  return NextResponse.json({ message: "Anggaran disimpan", id: budget.id });
}