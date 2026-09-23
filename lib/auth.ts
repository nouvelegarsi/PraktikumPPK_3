// lib/auth.ts
// ============================================================
// STUB untuk Modul B — jangan diimplementasikan di sini.
// File ini akan DIGANTIKAN oleh implementasi Modul A.
//
// Modul B hanya butuh satu fungsi: getSessionUser()
// yang mengembalikan { id, nama, email } atau null.
//
// Kontrak yang disepakati dengan Modul A:
//   - Baca cookie "session_id" (httpOnly)
//   - Cek ke tabel sessions di DB
//   - Return SessionUser jika valid & belum expired
//   - Return null jika tidak ada / expired
// ============================================================

import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export type SessionUser = {
  id: number;
  nama: string;
  email: string;
};

/**
 * Dipakai oleh Modul B untuk authorization transaksi.
 * Implementasi lengkap ada di Modul A — file ini hanya stub
 * agar Modul B bisa dikerjakan paralel.
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session_id")?.value;

  if (!sessionId) return null;

  const session = await prisma.session.findUnique({
    where: { session_id: sessionId },
    include: { user: true },
  });

  if (!session) return null;
  if (new Date() > session.expires_at) return null;

  return {
    id: session.user.id,
    nama: session.user.nama,
    email: session.user.email,
  };
}
