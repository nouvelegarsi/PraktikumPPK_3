import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import LogoutButton from "@/app/components/LogoutButton";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

function formatRupiah(jumlah: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(jumlah);
}

export default async function Dashboard() {
  // =========================
  // CEK SESSION USER
  // =========================
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  // =========================
  // AMBIL COOKIE LANGUAGE
  // =========================
  const cookieStore = await cookies();
  const bahasa = cookieStore.get("language")?.value || "id";

  // =========================
  // AMBIL TRANSAKSI USER
  // =========================
  const transaksi = await prisma.transaction.findMany({
    where: {
      userId: user.id,
    },
    include: {
      category: true,
    },
    orderBy: {
      tanggal: "desc",
    },
  });

  // =========================
  // HITUNG TOTAL
  // =========================
  const totalPemasukan = transaksi
    .filter((item) => item.jenis === "pemasukan")
    .reduce((total, item) => total + Number(item.jumlah), 0);

  const totalPengeluaran = transaksi
    .filter((item) => item.jenis === "pengeluaran")
    .reduce((total, item) => total + Number(item.jumlah), 0);

  const saldo = totalPemasukan - totalPengeluaran;

  // Hanya tampilkan 5 transaksi terbaru
  const transaksiTerbaru = transaksi.slice(0, 5);

  // =========================
  // TEXT LANGUAGE
  // =========================
  const teks =
    bahasa === "en"
      ? {
          dashboard: "Dashboard",
          welcome: "Welcome",
          saldo: "Current Balance",
          pemasukan: "Total Income",
          pengeluaran: "Total Expenses",
          transaksi: "Recent Transactions",
          tanggal: "Date",
          deskripsi: "Description",
          kategori: "Category",
          jenis: "Type",
          jumlah: "Amount",
          pemasukanJenis: "Income",
          pengeluaranJenis: "Expense",
          tanpaKategori: "No Category",
          tanpaDeskripsi: "-",
          kosong: "No transactions yet.",
        }
      : {
          dashboard: "Dashboard",
          welcome: "Selamat datang",
          saldo: "Saldo Saat Ini",
          pemasukan: "Total Pemasukan",
          pengeluaran: "Total Pengeluaran",
          transaksi: "Transaksi Terbaru",
          tanggal: "Tanggal",
          deskripsi: "Deskripsi",
          kategori: "Kategori",
          jenis: "Jenis",
          jumlah: "Jumlah",
          pemasukanJenis: "Pemasukan",
          pengeluaranJenis: "Pengeluaran",
          tanpaKategori: "Tanpa Kategori",
          tanpaDeskripsi: "-",
          kosong: "Belum ada transaksi.",
        };

  return (
    <main className="min-h-screen bg-gray-100 p-6 dark:bg-gray-900">
      <div className="mx-auto max-w-6xl">

        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {teks.dashboard}
            </h1>

            <p className="mt-2 text-gray-600 dark:text-gray-300">
              {teks.welcome}, {user.nama}
            </p>
          </div>

          <LogoutButton />
        </div>

        {/* RINGKASAN KEUANGAN */}
        <div className="mt-6 grid gap-4 md:grid-cols-3">

          {/* SALDO */}
          <div className="rounded-xl bg-white p-5 shadow dark:bg-gray-800">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {teks.saldo}
            </p>

            <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
              {formatRupiah(saldo)}
            </p>
          </div>

          {/* PEMASUKAN */}
          <div className="rounded-xl bg-white p-5 shadow dark:bg-gray-800">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {teks.pemasukan}
            </p>

            <p className="mt-2 text-2xl font-bold text-green-600">
              {formatRupiah(totalPemasukan)}
            </p>
          </div>

          {/* PENGELUARAN */}
          <div className="rounded-xl bg-white p-5 shadow dark:bg-gray-800">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {teks.pengeluaran}
            </p>

            <p className="mt-2 text-2xl font-bold text-red-600">
              {formatRupiah(totalPengeluaran)}
            </p>
          </div>
        </div>

        {/* TRANSAKSI TERBARU */}
        <div className="mt-8 rounded-xl bg-white p-6 shadow dark:bg-gray-800">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {teks.transaksi}
          </h2>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
                  <th className="px-4 py-3">{teks.tanggal}</th>
                  <th className="px-4 py-3">{teks.deskripsi}</th>
                  <th className="px-4 py-3">{teks.kategori}</th>
                  <th className="px-4 py-3">{teks.jenis}</th>
                  <th className="px-4 py-3 text-right">
                    {teks.jumlah}
                  </th>
                </tr>
              </thead>

              <tbody>
                {transaksiTerbaru.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-8 text-center text-sm text-gray-400"
                    >
                      {teks.kosong}
                    </td>
                  </tr>
                ) : (
                  transaksiTerbaru.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b last:border-0 dark:border-gray-700"
                    >
                      {/* TANGGAL */}
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                        {new Intl.DateTimeFormat(
                          bahasa === "en" ? "en-US" : "id-ID",
                          {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          }
                        ).format(new Date(item.tanggal))}
                      </td>

                      {/* DESKRIPSI */}
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                        {item.deskripsi || teks.tanpaDeskripsi}
                      </td>

                      {/* KATEGORI */}
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                        {item.category?.nama || teks.tanpaKategori}
                      </td>

                      {/* JENIS */}
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-200">
                        {item.jenis === "pemasukan"
                          ? teks.pemasukanJenis
                          : teks.pengeluaranJenis}
                      </td>

                      {/* JUMLAH */}
                      <td
                        className={`px-4 py-3 text-right font-medium ${
                          item.jenis === "pemasukan"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {item.jenis === "pemasukan" ? "+" : "-"}
                        {formatRupiah(Number(item.jumlah))}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}