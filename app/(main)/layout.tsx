import Link from "next/link";
import { ThemeProvider } from "../../src/context/ThemeContext";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 md:flex">
        <aside className="w-full border-b bg-white dark:border-gray-700 dark:bg-gray-800 md:min-h-screen md:w-64 md:border-b-0 md:border-r">
          <div className="p-6">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Finance App
            </h1>
          </div>

          <nav className="px-4 pb-4">
            <Link
              href="/dashboard"
              className="mb-2 block rounded-lg px-4 py-3 text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              Dashboard
            </Link>

            <Link
              href="/pengaturan"
              className="block rounded-lg px-4 py-3 text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              Pengaturan
            </Link>
          </nav>
        </aside>

        <section className="flex-1">
          {children}
        </section>
      </div>
    </ThemeProvider>
  );
}