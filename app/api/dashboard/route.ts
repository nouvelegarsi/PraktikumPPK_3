import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const user = await getSessionUser();

  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(req.url);
  const month = searchParams.get("month");

  const now = new Date();

  const selectedMonth = month
    ? Number(month.split("-")[1])
    : now.getMonth() + 1;

  const selectedYear = month
    ? Number(month.split("-")[0])
    : now.getFullYear();

  if (
    !Number.isInteger(selectedMonth) ||
    selectedMonth < 1 ||
    selectedMonth > 12 ||
    !Number.isInteger(selectedYear)
  ) {
    return NextResponse.json(
      { error: "Format bulan tidak valid" },
      { status: 400 }
    );
  }

  const startDate = new Date(
    selectedYear,
    selectedMonth - 1,
    1
  );

  const endDate = new Date(
    selectedYear,
    selectedMonth,
    1
  );

  const [budget, transactions] = await Promise.all([
    prisma.budget.findUnique({
      where: {
        userId_bulan_tahun: {
          userId: user.id,
          bulan: selectedMonth,
          tahun: selectedYear,
        },
      },
    }),

    prisma.transaction.findMany({
      where: {
        userId: user.id,
        tanggal: {
          gte: startDate,
          lt: endDate,
        },
      },
      orderBy: {
        tanggal: "desc",
      },
    }),
  ]);

  const totalPengeluaran = transactions
    .filter((item) => item.jenis === "pengeluaran")
    .reduce(
      (total, item) => total + Number(item.jumlah),
      0
    );

  const totalPemasukan = transactions
    .filter((item) => item.jenis === "pemasukan")
    .reduce(
      (total, item) => total + Number(item.jumlah),
      0
    );

  const totalBudget = budget ? Number(budget.jumlah) : 0;

  const sisaBudget = totalBudget - totalPengeluaran;

  const persentase =
    totalBudget > 0
      ? (totalPengeluaran / totalBudget) * 100
      : 0;

  let status = "aman";

  if (persentase >= 100) {
    status = "terlampaui";
  } else if (persentase >= 80) {
    status = "mendekati";
  }

  return NextResponse.json({
    month: `${selectedYear}-${String(selectedMonth).padStart(2, "0")}`,
    budget: totalBudget,
    pengeluaran: totalPengeluaran,
    pemasukan: totalPemasukan,
    sisaBudget: sisaBudget,
    persentase: Math.round(persentase),
    status,
  });
}