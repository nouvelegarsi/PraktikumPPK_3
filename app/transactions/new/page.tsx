"use client";

// app/transactions/new/page.tsx
// SRS-006 — Tambah transaksi baru

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Category = {
  id: number;
  nama: string;
  jenis: string | null;
};

export default function NewTransactionPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [jenis, setJenis] = useState<"pemasukan" | "pengeluaran">("pengeluaran");
  const [categoryId, setCategoryId] = useState("");
  const [jumlah, setJumlah] = useState("");
  const [tanggal, setTanggal] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [deskripsi, setDeskripsi] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Ambil kategori yang cocok dengan jenis dipilih
  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data: Category[]) => setCategories(data))
      .catch(() => {});
  }, []);

  const filteredCategories = categories.filter(
    (c) => c.jenis === jenis || c.jenis === null
  );

  const handleSubmit = async () => {
    setError("");
    if (!jumlah || isNaN(Number(jumlah)) || Number(jumlah) <= 0) {
      setError("Jumlah harus angka positif");
      return;
    }
    if (!tanggal) {
      setError("Tanggal wajib diisi");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jenis,
          category_id: categoryId || null,
          jumlah: Number(jumlah),
          tanggal,
          deskripsi: deskripsi || null,
        }),
      });

      if (res.status === 401) {
        router.push("/login");
        return;
      }

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Gagal menyimpan transaksi");
        return;
      }

      router.push("/transactions");
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/transactions"
            className="text-sm text-gray-400 hover:text-gray-600 mb-2 inline-block"
          >
            ← Kembali
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Tambah Transaksi</h1>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Jenis */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Jenis Transaksi
            </label>
            <div className="flex gap-3">
              {(["pengeluaran", "pemasukan"] as const).map((j) => (
                <button
                  key={j}
                  type="button"
                  onClick={() => {
                    setJenis(j);
                    setCategoryId("");
                  }}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium capitalize border transition-colors ${
                    jenis === j
                      ? j === "pemasukan"
                        ? "bg-green-600 text-white border-green-600"
                        : "bg-red-500 text-white border-red-500"
                      : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {j === "pemasukan" ? "↑ Pemasukan" : "↓ Pengeluaran"}
                </button>
              ))}
            </div>
          </div>

          {/* Jumlah */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Jumlah (Rp)
            </label>
            <input
              type="number"
              min="1"
              value={jumlah}
              onChange={(e) => setJumlah(e.target.value)}
              placeholder="0"
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Tanggal */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Tanggal
            </label>
            <input
              type="date"
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Kategori */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Kategori <span className="text-gray-400">(opsional)</span>
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">Pilih kategori...</option>
              {filteredCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nama}
                </option>
              ))}
            </select>
          </div>

          {/* Deskripsi */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Deskripsi <span className="text-gray-400">(opsional)</span>
            </label>
            <input
              type="text"
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              placeholder="Contoh: Makan siang, gaji bulan ini..."
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium py-3 rounded-lg text-sm transition-colors"
          >
            {loading ? "Menyimpan..." : "Simpan Transaksi"}
          </button>
        </div>
      </div>
    </div>
  );
}
