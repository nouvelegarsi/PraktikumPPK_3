"use client";

import { createContext, useContext, useEffect, useState } from "react";

type ThemeContextType = {
  tema: string;
  setTema: (tema: string) => void;
};

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [tema, setTema] = useState("light");

  // Ambil tema dari cookie saat aplikasi dibuka
  useEffect(() => {
    const cookies = document.cookie.split("; ");

    const cookieTema = cookies.find((item) =>
      item.startsWith("theme=")
    );

    if (cookieTema) {
      const value = cookieTema.split("=")[1];

      setTema(value);

      document.documentElement.classList.toggle(
        "dark",
        value === "dark"
      );
    }
  }, []);

  // Terapkan tema dan simpan ke cookie
  useEffect(() => {
    document.documentElement.classList.toggle(
      "dark",
      tema === "dark"
    );

    document.cookie = `theme=${tema}; path=/; max-age=31536000; SameSite=Lax`;
  }, [tema]);

  return (
    <ThemeContext.Provider value={{ tema, setTema }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error(
      "useTheme harus digunakan di dalam ThemeProvider"
    );
  }

  return context;
}