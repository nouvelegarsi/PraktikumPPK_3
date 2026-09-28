import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

function bulanTahunSekarang() {
  const now = new Date();
  return { bulan: now.getMonth() + 1, tahun: now.getFullYear() };
}

// GET /api/budget?bulan=9&tahun=2026 (default: bulan ini)
export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ message: "Belum login" }, { status: 401 });
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
      budget, // dipakai halaman monthly-budget
      sudahDiatur: !!budget,
      totalAnggaran, // dipakai BudgetSummary
      totalPengeluaran,
      sisaAnggaran: totalAnggaran - totalPengeluaran,
    });
  } catch (error) {
    console.error("GET budget error:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}

// POST /api/budget  body: { bulan, tahun, jumlah }
export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ message: "Belum login" }, { status: 401 });
    }

    const body = await request.json();

    const bulan = Number(body.bulan);
    const tahun = Number(body.tahun);
    const jumlah = Number(body.jumlah);

    if (!bulan || !tahun || !jumlah) {
      return NextResponse.json(
        { message: "Bulan, tahun, dan jumlah budget harus diisi" },
        { status: 400 }
      );
    }

    if (bulan < 1 || bulan > 12) {
      return NextResponse.json({ message: "Bulan tidak valid" }, { status: 400 });
    }

    if (tahun < 2000) {
      return NextResponse.json({ message: "Tahun tidak valid" }, { status: 400 });
    }

    if (jumlah <= 0) {
      return NextResponse.json(
        { message: "Jumlah budget harus lebih dari 0" },
        { status: 400 }
      );
    }

    const budget = await prisma.budget.upsert({
      where: { userId_bulan_tahun: { userId: user.id, bulan, tahun } },
      update: { jumlah },
      create: { userId: user.id, bulan, tahun, jumlah },
    });

    return NextResponse.json({
      message: "Budget berhasil disimpan",
      budget,
    });
  } catch (error) {
    console.error("POST budget error:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}