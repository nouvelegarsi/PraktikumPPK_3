import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("session_id")?.value;

    if (sessionId) {
      await prisma.session.deleteMany({
        where: {
          sessionId: sessionId,
        },
      });
    }

    const response = NextResponse.json({
      message: "Logout berhasil",
    });

    response.cookies.set("session_id", "", {
      httpOnly: true,
      expires: new Date(0),
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Logout error:", error);

    return NextResponse.json(
      {
        message: "Terjadi kesalahan saat logout",
      },
      { status: 500 }
    );
  }
}