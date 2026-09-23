"use client";

import { useEffect, useState } from "react";

export default function Pengaturan() {
  const [tema, setTema] = useState("light");
  const [bahasa, setBahasa] = useState("id");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", tema === "dark");
  }, [tema]);

  return (
    <main className="min-h-screen bg-gray-100 p-6 dark:bg-gray-900">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Pengaturan
        </h1>

        <p className="mt-2 text-gray-600 dark:text-gray-300">
          Atur preferensi aplikasi kamu di sini.
        </p>

        <div className="mt-6 rounded-xl bg-white p-6 shadow dark:bg-gray-800">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Preferensi
          </h2>

          <div className="mt-6">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Tema
            </label>

            <select
              value={tema}
              onChange={(e) => setTema(e.target.value)}
              className="mt-2 w-full rounded-lg border bg-white px-4 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>

          <div className="mt-5">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Bahasa
            </label>

            <select
              value={bahasa}
              onChange={(e) => setBahasa(e.target.value)}
              className="mt-2 w-full rounded-lg border bg-white px-4 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="id">Indonesia</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>
      </div>
    </main>
  );
}