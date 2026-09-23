"use client";

// app/transactions/[id]/edit/page.tsx
// SRS-008 — Ubah transaksi, validasi kepemilikan di API (bukan di sini)

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

type Category = {
  id: number;
  nama: string;
  jenis: string | null;
};

export default function EditTransactionPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [categories, setCategories] = useState<Category[]>([]);
  const [jenis, setJenis] = useState<"pemasukan" | "pengeluaran">("pengeluaran");
  const [categoryId, setCategoryId] = useState("");
  const [jumlah, setJumlah] = useState("");
  const [tanggal, setTanggal] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");

  // Load data transaksi yang akan diedit
  useEffect(() => {
    const load = async () => {
      try {
        const [txRes, catRes] = await Promise.all([
          fetch(`/api/transactions/${id}`),
          fetch("/api/categories"),
        ]);

        if (txRes.status === 401) {
          router.push("/login");
          return;
        }
        if (txRes.status === 403 || txRes.status === 404) {
          router.push("/transactions");
          return;
        }

        const tx = await txRes.json();
        const cats: Category[] = catRes.ok ? await catRes.json() : [];

        setJenis(tx.jenis);
        setJumlah(String(tx.jumlah));
        setTanggal(tx.tanggal.split("T")[0]);
        setDeskripsi(tx.deskripsi ?? "");
        setCategoryId(tx.category_id ? String(tx.category_id) : "");
        setCategories(cats);
      } catch {
        setError("Gagal memuat data transaksi.");
      } finally {
        setFetching(false);
      }
    };
    load();
  }, [id, router]);

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
      const res = await fetch(`/api/transactions/${id}`, {
        method: "PUT",
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
      if (res.status === 403) {
        setError("Kamu tidak punya akses ke transaksi ini.");
        return;
      }
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Gagal mengubah transaksi");
        return;
      }

      router.push("/transactions");
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400 text-sm">Memuat...</p>
      </div>
    );
  }

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
          <h1 className="text-2xl font-bold text-gray-900">Edit Transaksi</h1>
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
            {loading ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>
      </div>
    </div>
  );
}
