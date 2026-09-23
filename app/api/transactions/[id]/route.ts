// app/api/transactions/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

// Helper: ambil transaksi & validasi kepemilikan (SRS-011)
async function getOwnedTransaction(id: number, userId: number) {
  const transaction = await prisma.transaction.findUnique({
    where: { id },
  });

  if (!transaction) return { error: "Transaksi tidak ditemukan", status: 404 };

  // SRS-011 & SRS-008 & SRS-009: validasi kepemilikan
  if (transaction.user_id !== userId) {
    return { error: "Forbidden", status: 403 };
  }

  return { transaction };
}

// GET /api/transactions/[id]
// Ambil satu transaksi (dipakai halaman edit) — validasi kepemilikan (SRS-011)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: idStr } = await params;
  const id = Number(idStr);
  if (isNaN(id)) {
    return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });
  }

  const owned = await getOwnedTransaction(id, user.id);
  if ("error" in owned) {
    return NextResponse.json({ error: owned.error }, { status: owned.status });
  }

  return NextResponse.json(owned.transaction);
}

// PUT /api/transactions/[id]
// SRS-008 — Ubah transaksi, validasi kepemilikan via session
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: idStr } = await params;
  const id = Number(idStr);
  if (isNaN(id)) {
    return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });
  }

  const owned = await getOwnedTransaction(id, user.id);
  if ("error" in owned) {
    return NextResponse.json({ error: owned.error }, { status: owned.status });
  }

  const body = await req.json();
  const { jenis, category_id, jumlah, tanggal, deskripsi } = body;

  if (jenis && jenis !== "pemasukan" && jenis !== "pengeluaran") {
    return NextResponse.json(
      { error: "Jenis harus 'pemasukan' atau 'pengeluaran'" },
      { status: 400 }
    );
  }

  if (jumlah && (isNaN(Number(jumlah)) || Number(jumlah) <= 0)) {
    return NextResponse.json(
      { error: "Jumlah harus berupa angka positif" },
      { status: 400 }
    );
  }

  const updated = await prisma.transaction.update({
    where: { id },
    data: {
      ...(jenis && { jenis }),
      ...(category_id !== undefined && {
        category_id: category_id ? Number(category_id) : null,
      }),
      ...(jumlah && { jumlah: Number(jumlah) }),
      ...(tanggal && { tanggal: new Date(tanggal) }),
      ...(deskripsi !== undefined && { deskripsi: deskripsi || null }),
    },
    include: { category: true },
  });

  return NextResponse.json(updated);
}

// DELETE /api/transactions/[id]
// SRS-009 — Hapus transaksi, validasi kepemilikan via session
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: idStr } = await params;
  const id = Number(idStr);
  if (isNaN(id)) {
    return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });
  }

  const owned = await getOwnedTransaction(id, user.id);
  if ("error" in owned) {
    return NextResponse.json({ error: owned.error }, { status: owned.status });
  }

  await prisma.transaction.delete({ where: { id } });

  return NextResponse.json({ message: "Transaksi berhasil dihapus" });
}
