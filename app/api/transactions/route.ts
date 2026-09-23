// app/api/transactions/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

// GET /api/transactions?jenis=pemasukan|pengeluaran
// SRS-007 — Lihat transaksi milik user yang login
// SRS-010 — Filter berdasarkan jenis
// SRS-018 — Query difilter user_id dari session, bukan dari client
export async function GET(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const jenis = searchParams.get("jenis"); // 'pemasukan' | 'pengeluaran' | null

  const transactions = await prisma.transaction.findMany({
    where: {
      user_id: user.id, // SRS-018: selalu filter dari session
      ...(jenis && (jenis === "pemasukan" || jenis === "pengeluaran")
        ? { jenis }
        : {}),
    },
    include: {
      category: true,
    },
    orderBy: {
      tanggal: "desc",
    },
  });

  return NextResponse.json(transactions);
}

// POST /api/transactions
// SRS-006 — Tambah transaksi, otomatis terhubung ke user yang login
export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { jenis, category_id, jumlah, tanggal, deskripsi } = body;

  // Validasi field wajib
  if (!jenis || !jumlah || !tanggal) {
    return NextResponse.json(
      { error: "Jenis, jumlah, dan tanggal wajib diisi" },
      { status: 400 }
    );
  }

  if (jenis !== "pemasukan" && jenis !== "pengeluaran") {
    return NextResponse.json(
      { error: "Jenis harus 'pemasukan' atau 'pengeluaran'" },
      { status: 400 }
    );
  }

  if (isNaN(Number(jumlah)) || Number(jumlah) <= 0) {
    return NextResponse.json(
      { error: "Jumlah harus berupa angka positif" },
      { status: 400 }
    );
  }

  const transaction = await prisma.transaction.create({
    data: {
      user_id: user.id, // SRS-006: otomatis dari session, bukan dari form
      jenis,
      category_id: category_id ? Number(category_id) : null,
      jumlah: Number(jumlah),
      tanggal: new Date(tanggal),
      deskripsi: deskripsi || null,
    },
    include: { category: true },
  });

  return NextResponse.json(transaction, { status: 201 });
}
