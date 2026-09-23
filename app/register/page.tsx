"use client";

import Link from "next/link";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-teal-100 px-4">

      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-600 text-white text-3xl shadow-lg">
            💰
          </div>

          <h1 className="text-3xl font-bold text-gray-900">
            ExpandsTracker
          </h1>

          <p className="mt-2 text-gray-500">
            Kelola keuanganmu dengan lebih mudah
          </p>
        </div>


        {/* Card */}
        <div className="rounded-3xl bg-white p-8 shadow-xl border border-gray-100">

          <h2 className="text-2xl font-semibold text-gray-800">
            Buat Akun
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Daftar untuk mulai mencatat keuangan pribadi
          </p>


          <form className="mt-6 space-y-5">


            {/* Nama */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Nama
              </label>

              <input
                type="text"
                placeholder="Masukkan nama"
                className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>


            {/* Email */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Email
              </label>

              <input
                type="email"
                placeholder="nama@email.com"
                className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>


            {/* Password */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Password
              </label>

              <input
                type="password"
                placeholder="Minimal 8 karakter"
                className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>


            <button
              type="submit"
              className="w-full rounded-xl bg-emerald-600 py-3 font-semibold text-white transition hover:bg-emerald-700 active:scale-[0.98]"
            >
              Daftar Sekarang
            </button>

          </form>


          <p className="mt-6 text-center text-sm text-gray-500">

            Sudah punya akun?

            <Link
              href="/login"
              className="ml-1 font-semibold text-emerald-600 hover:underline"
            >
              Login
            </Link>

          </p>

        </div>

      </div>

    </div>
  );
}