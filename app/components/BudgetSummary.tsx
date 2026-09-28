"use client";

import { useEffect, useState } from "react";

type Ringkasan = {
  bulan: number;
  tahun: number;
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

type StatusBudget = "aman" | "mendekati" | "melebihi";

type GayaStatus = {
  bar: string;
  badge: string;
};

function hitungStatus(anggaran: number, pengeluaran: number) {
  if (anggaran <= 0) return null;

  const persen = (pengeluaran / anggaran) * 100;
  let status: StatusBudget = "aman";
  if (persen > 100) status = "melebihi";
  else if (persen >= 80) status = "mendekati";

  return { persen, status };
}

const gayaStatus: Record<StatusBudget, GayaStatus> = {
  aman: {
    bar: "bg-green-500",
    badge: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  },
  mendekati: {
    bar: "bg-yellow-500",
    badge: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  },
  melebihi: {
    bar: "bg-red-600",
    badge: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  },
};

export default function BudgetSummary({ bahasa }: { bahasa: string }) {
  const [data, setData] = useState<Ringkasan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const teks =
    bahasa === "en"
      ? {
          judul: "Monthly Budget",
          anggaran: "Total Budget",
          pengeluaran: "Total Expenses",
          sisa: "Remaining Budget",
          memuat: "Loading...",
          gagalMuat: "Failed to load budget data.",
          terpakai: "used",
          statusAman: "Safe",
          statusMendekati: "Near limit",
          statusMelebihi: "Over budget",
          pesanAman: "Your spending is still within a safe range.",
          pesanMendekati: "Your spending is close to the budget limit.",
          pesanMelebihi: "Your spending exceeds the budget by",
        }
      : {
          judul: "Budget Bulanan",
          anggaran: "Total Anggaran",
          pengeluaran: "Total Pengeluaran",
          sisa: "Sisa Anggaran",
          memuat: "Memuat...",
          gagalMuat: "Gagal memuat data budget.",
          terpakai: "terpakai",
          statusAman: "Aman",
          statusMendekati: "Mendekati batas",
          statusMelebihi: "Melebihi anggaran",
          pesanAman: "Pengeluaranmu masih dalam batas aman.",
          pesanMendekati: "Pengeluaranmu sudah mendekati batas anggaran.",
          pesanMelebihi: "Pengeluaranmu melebihi anggaran sebesar",
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

  const indikator = data
    ? hitungStatus(data.totalAnggaran, data.totalPengeluaran)
    : null;

  const labelStatus = {
    aman: teks.statusAman,
    mendekati: teks.statusMendekati,
    melebihi: teks.statusMelebihi,
  };

  const pesanStatus = {
    aman: teks.pesanAman,
    mendekati: teks.pesanMendekati,
    melebihi: `${teks.pesanMelebihi} ${formatRupiah(
      Math.abs(data?.sisaAnggaran ?? 0)
    )}.`,
  };

  const namaBulan = data
    ? new Intl.DateTimeFormat(bahasa === "en" ? "en-US" : "id-ID", {
        month: "long",
        year: "numeric",
      }).format(new Date(data.tahun, data.bulan - 1, 1))
    : "";

  return (
    <div className="mt-8 rounded-xl bg-white p-6 shadow dark:bg-gray-800">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
        {teks.judul} {namaBulan && `- ${namaBulan}`}
      </h2>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      {loading ? (
        <p className="mt-4 text-sm text-gray-400">{teks.memuat}</p>
      ) : (
        data && (
          <>
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
                    data.sisaAnggaran < 0 ? "text-red-600" : "text-green-600"
                  }`}
                >
                  {formatRupiah(data.sisaAnggaran)}
                </p>
              </div>
            </div>

            {indikator && (
              <div className="mt-4 rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span
                    className={`rounded-full px-3 py-1 text-sm font-semibold ${
                      gayaStatus[indikator.status].badge
                    }`}
                  >
                    {labelStatus[indikator.status]}
                  </span>

                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    {Math.round(indikator.persen)}% {teks.terpakai}
                  </span>
                </div>

                <div
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={Math.min(Math.round(indikator.persen), 100)}
                  aria-label={labelStatus[indikator.status]}
                  className="mt-3 h-3 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-600"
                >
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      gayaStatus[indikator.status].bar
                    }`}
                    style={{ width: `${Math.min(indikator.persen, 100)}%` }}
                  />
                </div>

                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                  {pesanStatus[indikator.status]}
                </p>
              </div>
            )}
          </>
        )
      )}
    </div>
  );
}