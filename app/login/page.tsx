"use client";

import Link from "next/link";


export default function LoginPage() {

  return (

    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-teal-100 px-4">


      <div className="w-full max-w-md">


        {/* Header */}
        <div className="text-center mb-8">

          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-600 text-white text-3xl shadow-lg">
            💰
          </div>


          <h1 className="text-3xl font-bold text-gray-900">
            ExpandsTracker
          </h1>


          <p className="mt-2 text-gray-500">
            Selamat datang kembali 👋
          </p>


        </div>



        <div className="rounded-3xl bg-white p-8 shadow-xl border border-gray-100">


          <h2 className="text-2xl font-semibold text-gray-800">
            Login
          </h2>


          <p className="mt-2 text-sm text-gray-500">
            Masuk untuk melihat kondisi keuanganmu
          </p>



          <form className="mt-6 space-y-5">


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



            <div>

              <label className="text-sm font-medium text-gray-700">
                Password
              </label>


              <input
                type="password"
                placeholder="Masukkan password"
                className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />


            </div>



            <button
              type="submit"
              className="w-full rounded-xl bg-emerald-600 py-3 font-semibold text-white transition hover:bg-emerald-700 active:scale-[0.98]"
            >
              Masuk
            </button>


          </form>



          <p className="mt-6 text-center text-sm text-gray-500">

            Belum punya akun?

            <Link
              href="/register"
              className="ml-1 font-semibold text-emerald-600 hover:underline"
            >
              Daftar
            </Link>

          </p>



        </div>



      </div>


    </div>

  );
}