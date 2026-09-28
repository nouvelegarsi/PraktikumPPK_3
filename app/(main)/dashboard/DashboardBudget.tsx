"use client";

import { useEffect, useState } from "react";

type BudgetData = {
  month: string;
  budget: number;
  pengeluaran: number;
  pemasukan: number;
  sisaBudget: number;
  persentase: number;
  status: string;
};

function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function getCurrentMonth() {
  const now = new Date();

  return `${now.getFullYear()}-${String(
    now.getMonth() + 1
  ).padStart(2, "0")}`;
}

export default function DashboardBudget() {
  const [month, setMonth] = useState(getCurrentMonth());
  const [data, setData] = useState<BudgetData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchBudget = async (selectedMonth: string) => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(
        `/api/dashboard?month=${selectedMonth}`
      );

      if (res.status === 401) {
        window.location.href = "/login";
        return;
      }

      if (!res.ok) {
        throw new Error("Gagal mengambil data budget");
      }

      const result = await res.json();

      setData(result);
    } catch {
      setError("Gagal memuat data budget.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudget(month);
  }, [month]);

  return (
    <div className="mt-6">
      <div className="rounded-xl bg-white p-5 shadow dark:bg-gray-800">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Budget Bulanan
            </h2>

            <p className="text-sm text-gray-500 dark:text-gray-400">
              Pilih bulan untuk melihat penggunaan budget
            </p>
          </div>

          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
        </div>

        {loading && (
          <p className="mt-6 text-sm text-gray-500">
            Memuat data...
          </p>
        )}

        {error && (
          <p className="mt-6 text-sm text-red-500">
            {error}
          </p>
        )}

        {!loading && !error && data && (
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-300">
                Budget
              </p>

              <p className="mt-2 text-xl font-bold text-gray-900 dark:text-white">
                {formatRupiah(data.budget)}
              </p>
            </div>

            <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-300">
                Pengeluaran
              </p>

              <p className="mt-2 text-xl font-bold text-red-600">
                {formatRupiah(data.pengeluaran)}
              </p>
            </div>

            <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-300">
                Sisa Budget
              </p>

              <p className="mt-2 text-xl font-bold text-green-600">
                {formatRupiah(data.sisaBudget)}
              </p>
            </div>
          </div>
        )}

        {!loading && !error && data && (
          <div className="mt-5">
            <div className="mb-2 flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-300">
                Penggunaan budget
              </span>

              <span className="font-medium">
                {data.persentase}%
              </span>
            </div>

            <div className="h-3 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-600">
              <div
                className="h-full rounded-full bg-blue-600 transition-all"
                style={{
                  width: `${Math.min(data.persentase, 100)}%`,
                }}
              />
            </div>

            <p className="mt-2 text-sm text-gray-500">
              Status: {data.status}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}