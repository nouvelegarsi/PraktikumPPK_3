"use client";

export default function LogoutButton() {
  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (!res.ok) {
        throw new Error("Logout gagal");
      }

      window.location.href = "/login";
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan saat logout");
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
    >
      Logout
    </button>
  );
}