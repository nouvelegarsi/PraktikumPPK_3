"use client";

import { useEffect, useState } from "react";

type Ringkasan = {
  bulan: number;
  tahun: number;
  sudahDiatur: boolean;
  totalAnggaran: number;
  totalPengeluaran: number;
  sisaAnggaran: number;
};

function formatRupiah(jumlah: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(jumlah);
}

export default function BudgetSummary({ bahasa }: { bahasa: string }) {
  const [data, setData] = useState<Ringkasan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [input, setInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

  const teks =
    bahasa === "en"
      ? {
          judul: "Monthly Budget",
          anggaran: "Total Budget",
          pengeluaran: "Total Expenses",
          sisa: "Remaining Budget",
          atur: "Set budget",
          ubah: "Edit budget",
          simpan: "Save",
          menyimpan: "Saving...",
          batal: "Cancel",
          placeholder: "Budget amount (Rp)",
          memuat: "Loading...",
          belum: "No budget set for this month yet.",
          gagalMuat: "Failed to load budget data.",
          gagalSimpan: "Failed to save budget.",
        }
      : {
          judul: "Budget Bulanan",
          anggaran: "Total Anggaran",
          pengeluaran: "Total Pengeluaran",
          sisa: "Sisa Anggaran",
          atur: "Atur anggaran",
          ubah: "Ubah anggaran",
          simpan: "Simpan",
          menyimpan: "Menyimpan...",
          batal: "Batal",
          placeholder: "Jumlah anggaran (Rp)",
          memuat: "Memuat...",
          belum: "Anggaran bulan ini belum diatur.",
          gagalMuat: "Gagal memuat data budget.",
          gagalSimpan: "Gagal menyimpan anggaran.",
        };

  async function ambilData() {
    try {
      const res = await fetch("/api/budget", { cache: "no-store" });
      if (!res.ok) throw new Error();
      setData(await res.json());
      setError("");
    } catch {
      setError(teks.gagalMuat);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    ambilData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function simpanAnggaran(e: React.SyntheticEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/budget", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jumlah: Number(input) }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.message || teks.gagalSimpan);
      }
      setEditing(false);
      setInput("");
      await ambilData(); // refresh kartu tanpa reload halaman
    } catch (err) {
      setError(err instanceof Error ? err.message : teks.gagalSimpan);
    } finally {
      setSaving(false);
    }
  }

  const namaBulan = data
    ? new Intl.DateTimeFormat(bahasa === "en" ? "en-US" : "id-ID", {
        month: "long",
        year: "numeric",
      }).format(new Date(data.tahun, data.bulan - 1, 1))
    : "";

  return (
    <div className="mt-8 rounded-xl bg-white p-6 shadow dark:bg-gray-800">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          {teks.judul} {namaBulan && `- ${namaBulan}`}
        </h2>

        {!editing && data && (
          <button
            onClick={() => {
              setInput(data.sudahDiatur ? String(data.totalAnggaran) : "");
              setEditing(true);
            }}
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 dark:bg-white dark:text-gray-900"
          >
            {data.sudahDiatur ? teks.ubah : teks.atur}
          </button>
        )}
      </div>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      {editing && (
        <div className="mt-4 flex flex-wrap gap-2">
          <input
            type="number"
            min="1"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={teks.placeholder}
            className="w-64 rounded-lg border border-gray-300 px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
          <button
            onClick={simpanAnggaran}
            disabled={saving || !input}
            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {saving ? teks.menyimpan : teks.simpan}
          </button>
          <button
            onClick={() => setEditing(false)}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 dark:border-gray-600 dark:text-gray-200"
          >
            {teks.batal}
          </button>
        </div>
      )}

      {loading ? (
        <p className="mt-4 text-sm text-gray-400">{teks.memuat}</p>
      ) : (
        data && (
          <>
            {!data.sudahDiatur && (
              <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                {teks.belum}
              </p>
            )}

            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-300">
                  {teks.anggaran}
                </p>
                <p className="mt-1 text-xl font-bold text-gray-900 dark:text-white">
                  {formatRupiah(data.totalAnggaran)}
                </p>
              </div>

              <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-300">
                  {teks.pengeluaran}
                </p>
                <p className="mt-1 text-xl font-bold text-red-600">
                  {formatRupiah(data.totalPengeluaran)}
                </p>
              </div>

              <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-300">
                  {teks.sisa}
                </p>
                <p
                  className={`mt-1 text-xl font-bold ${
                    data.sisaAnggaran < 0
                      ? "text-red-600"
                      : "text-green-600"
                  }`}
                >
                  {formatRupiah(data.sisaAnggaran)}
                </p>
              </div>
            </div>
          </>
        )
      )}
    </div>
  );
}