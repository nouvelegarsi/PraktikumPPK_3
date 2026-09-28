"use client";

import { FormEvent, useEffect, useState } from "react";

export default function BudgetPage() {
  const [bulan, setBulan] = useState(new Date().getMonth() + 1);
  const [tahun, setTahun] = useState(new Date().getFullYear());
  const [jumlah, setJumlah] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const namaBulan = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];

  async function ambilBudget() {
    try {
      setLoadingData(true);
      setError("");
      setMessage("");

      const response = await fetch(
        `/api/budget?bulan=${bulan}&tahun=${tahun}`
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Gagal mengambil budget");
        return;
      }

      if (data.budget) {
        setJumlah(String(data.budget.jumlah));
      } else {
        setJumlah("");
      }
    } catch {
      setError("Terjadi kesalahan saat mengambil budget");
    } finally {
      setLoadingData(false);
    }
  }

  useEffect(() => {
    ambilBudget();
  }, [bulan, tahun]);

  async function simpanBudget(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/budget", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bulan,
          tahun,
          jumlah: Number(jumlah),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Gagal menyimpan budget");
        return;
      }

      setMessage("Budget berhasil disimpan.");
      setJumlah(String(data.budget.jumlah));
    } catch {
      setError("Terjadi kesalahan saat menyimpan budget");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Budget Bulanan
          </h1>

          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Atur batas pengeluaran untuk setiap bulan.
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <form onSubmit={simpanBudget} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-100">
                Bulan
              </label>

              <select
                value={bulan}
                onChange={(event) => setBulan(Number(event.target.value))}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                {namaBulan.map((nama, index) => (
                  <option key={index + 1} value={index + 1}>
                    {nama}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-100">
                Tahun
              </label>

              <input
                type="number"
                value={tahun}
                onChange={(event) => setTahun(Number(event.target.value))}
                min="2000"
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-100">
                Jumlah Budget
              </label>

              <input
                type="number"
                value={jumlah}
                onChange={(event) => setJumlah(event.target.value)}
                min="1"
                placeholder="Contoh: 1000000"
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
              />
            </div>

            {loadingData && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Memuat budget...
              </p>
            )}

            {message && (
              <p className="text-sm text-green-600 dark:text-green-400">
                {message}
              </p>
            )}

            {error && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || loadingData}
              className="w-full rounded-lg bg-black px-4 py-2 text-white hover:bg-gray-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-gray-200"
            >
              {loading ? "Menyimpan..." : "Simpan Budget"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}