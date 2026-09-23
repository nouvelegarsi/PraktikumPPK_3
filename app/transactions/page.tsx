"use client";

// app/transactions/page.tsx
// SRS-007 — Lihat daftar transaksi
// SRS-010 — Filter berdasarkan jenis

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Category = {
  id: number;
  nama: string;
  jenis: string | null;
};

type Transaction = {
  id: number;
  jenis: "pemasukan" | "pengeluaran";
  jumlah: number;
  deskripsi: string | null;
  tanggal: string;
  category: Category | null;
};

type FilterJenis = "semua" | "pemasukan" | "pengeluaran";

export default function TransactionsPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filter, setFilter] = useState<FilterJenis>("semua");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchTransactions = async (jenis: FilterJenis) => {
    setLoading(true);
    setError("");
    try {
      const url =
        jenis === "semua"
          ? "/api/transactions"
          : `/api/transactions?jenis=${jenis}`;
      const res = await fetch(url);
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      if (!res.ok) throw new Error("Gagal memuat transaksi");
      const data = await res.json();
      setTransactions(data);
    } catch {
      setError("Gagal memuat transaksi. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions(filter);
  }, [filter]);

  const handleDelete = async (id: number) => {
    if (!confirm("Hapus transaksi ini?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/transactions/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Gagal menghapus");
        return;
      }
      setTransactions((prev) => prev.filter((t) => t.id !== id));
    } catch {
      alert("Terjadi kesalahan.");
    } finally {
      setDeletingId(null);
    }
  };

  const formatRupiah = (amount: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);

  const formatTanggal = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Transaksi</h1>
            <p className="text-sm text-gray-500 mt-1">
              Kelola pemasukan dan pengeluaran kamu
            </p>
          </div>
          <Link
            href="/transactions/new"
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            + Tambah
          </Link>
        </div>

        {/* Filter Tabs — SRS-010 */}
        <div className="flex gap-2 mb-6">
          {(["semua", "pemasukan", "pengeluaran"] as FilterJenis[]).map(
            (f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                  filter === f
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                }`}
              >
                {f}
              </button>
            )
          )}
        </div>

        {/* States */}
        {loading && (
          <div className="text-center py-16 text-gray-400">Memuat...</div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        {!loading && !error && transactions.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-400 text-sm">Belum ada transaksi.</p>
            <Link
              href="/transactions/new"
              className="text-blue-600 text-sm mt-2 inline-block hover:underline"
            >
              Tambah transaksi pertama
            </Link>
          </div>
        )}

        {/* List */}
        {!loading && !error && transactions.length > 0 && (
          <div className="space-y-3">
            {transactions.map((t) => (
              <div
                key={t.id}
                className="bg-white rounded-xl border border-gray-100 px-5 py-4 flex items-center justify-between shadow-sm"
              >
                {/* Left */}
                <div className="flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${
                      t.jenis === "pemasukan"
                        ? "bg-green-100 text-green-600"
                        : "bg-red-100 text-red-500"
                    }`}
                  >
                    {t.jenis === "pemasukan" ? "↑" : "↓"}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {t.category?.nama ?? "Tanpa Kategori"}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {formatTanggal(t.tanggal)}
                      {t.deskripsi && ` · ${t.deskripsi}`}
                    </p>
                  </div>
                </div>

                {/* Right */}
                <div className="flex items-center gap-3">
                  <span
                    className={`text-sm font-semibold ${
                      t.jenis === "pemasukan"
                        ? "text-green-600"
                        : "text-red-500"
                    }`}
                  >
                    {t.jenis === "pemasukan" ? "+" : "-"}
                    {formatRupiah(t.jumlah)}
                  </span>
                  <Link
                    href={`/transactions/${t.id}/edit`}
                    className="text-xs text-blue-500 hover:underline"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(t.id)}
                    disabled={deletingId === t.id}
                    className="text-xs text-red-400 hover:underline disabled:opacity-50"
                  >
                    {deletingId === t.id ? "..." : "Hapus"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
