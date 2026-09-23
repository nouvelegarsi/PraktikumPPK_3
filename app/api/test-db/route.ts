import { pool } from "@/lib/db";

export async function GET() {
  try {
    const result = await pool.query("SELECT NOW()");

    return Response.json({
      success: true,
      message: "Koneksi PostgreSQL berhasil!",
      time: result.rows[0].now,
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      {
        success: false,
        message: "Koneksi PostgreSQL gagal",
      },
      { status: 500 }
    );
  }
}