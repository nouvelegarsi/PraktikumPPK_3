import { cookies } from "next/headers";

const transaksi = [
  {
    tanggal: "23 September 2026",
    deskripsi: "Makan siang",
    kategori: "Makanan",
    jenis: "pengeluaran",
    jumlah: 25000,
  },
  {
    tanggal: "22 September 2026",
    deskripsi: "Uang saku",
    kategori: "Pemasukan",
    jenis: "pemasukan",
    jumlah: 500000,
  },
  {
    tanggal: "21 September 2026",
    deskripsi: "Transportasi",
    kategori: "Transportasi",
    jenis: "pengeluaran",
    jumlah: 15000,
  },
  {
    tanggal: "20 September 2026",
    deskripsi: "Beli buku",
    kategori: "Pendidikan",
    jenis: "pengeluaran",
    jumlah: 75000,
  },
  {
    tanggal: "19 September 2026",
    deskripsi: "Freelance",
    kategori: "Pemasukan",
    jenis: "pemasukan",
    jumlah: 300000,
  },
];

function formatRupiah(jumlah: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(jumlah);
}

export default async function Dashboard() {
  const cookieStore = await cookies();

  const bahasa = cookieStore.get("language")?.value || "id";

  const nama = "Nama Pengguna";

  const totalPemasukan = transaksi
    .filter((item) => item.jenis === "pemasukan")
    .reduce((total, item) => total + item.jumlah, 0);

  const totalPengeluaran = transaksi
    .filter((item) => item.jenis === "pengeluaran")
    .reduce((total, item) => total + item.jumlah, 0);

  const saldo = totalPemasukan - totalPengeluaran;

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
          pemasukanJenis: "Income",
          pengeluaranJenis: "Expense",
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
          pemasukanJenis: "Pemasukan",
          pengeluaranJenis: "Pengeluaran",
        };

  return (
    <main className="min-h-screen bg-gray-100 p-6 dark:bg-gray-900">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {teks.dashboard}
          </h1>

          <p className="mt-2 text-gray-600 dark:text-gray-300">
            {teks.welcome}, {nama}
          </p>
        </div>

        {/* Ringkasan Keuangan */}
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {/* Saldo */}
          <div className="rounded-xl bg-white p-5 shadow dark:bg-gray-800">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {teks.saldo}
            </p>

            <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
              {formatRupiah(saldo)}
            </p>
          </div>

          {/* Pemasukan */}
          <div className="rounded-xl bg-white p-5 shadow dark:bg-gray-800">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {teks.pemasukan}
            </p>

            <p className="mt-2 text-2xl font-bold text-green-600">
              {formatRupiah(totalPemasukan)}
            </p>
          </div>

          {/* Pengeluaran */}
          <div className="rounded-xl bg-white p-5 shadow dark:bg-gray-800">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {teks.pengeluaran}
            </p>

            <p className="mt-2 text-2xl font-bold text-red-600">
              {formatRupiah(totalPengeluaran)}
            </p>
          </div>
        </div>

        {/* Transaksi Terbaru */}
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
                {transaksi.map((item, index) => (
                  <tr
                    key={index}
                    className="border-b last:border-0 dark:border-gray-700"
                  >
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                      {item.tanggal}
                    </td>

                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                      {item.deskripsi}
                    </td>

                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                      {item.kategori}
                    </td>

                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-200">
                      {item.jenis === "pemasukan"
                        ? teks.pemasukanJenis
                        : teks.pengeluaranJenis}
                    </td>

                    <td
                      className={`px-4 py-3 text-right font-medium ${
                        item.jenis === "pemasukan"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {item.jenis === "pemasukan" ? "+" : "-"}
                      {formatRupiah(item.jumlah)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}