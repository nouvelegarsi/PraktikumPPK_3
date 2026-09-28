import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser();

    if (!user) {
      return NextResponse.json(
        { message: "Belum login" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const bulan = Number(searchParams.get("bulan"));
    const tahun = Number(searchParams.get("tahun"));

    if (!bulan || !tahun) {
      return NextResponse.json(
        { message: "Bulan dan tahun harus diisi" },
        { status: 400 }
      );
    }

    const budget = await prisma.budget.findUnique({
      where: {
        userId_bulan_tahun: {
          userId: user.id,
          bulan: bulan,
          tahun: tahun,
        },
      },
    });

    return NextResponse.json({
      budget,
    });
  } catch (error) {
    console.error("GET budget error:", error);

    return NextResponse.json(
      { message: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser();

    if (!user) {
      return NextResponse.json(
        { message: "Belum login" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const bulan = Number(body.bulan);
    const tahun = Number(body.tahun);
    const jumlah = Number(body.jumlah);

    if (!bulan || !tahun || !jumlah) {
      return NextResponse.json(
        { message: "Bulan, tahun, dan jumlah budget harus diisi" },
        { status: 400 }
      );
    }

    if (bulan < 1 || bulan > 12) {
      return NextResponse.json(
        { message: "Bulan tidak valid" },
        { status: 400 }
      );
    }

    if (tahun < 2000) {
      return NextResponse.json(
        { message: "Tahun tidak valid" },
        { status: 400 }
      );
    }

    if (jumlah <= 0) {
      return NextResponse.json(
        { message: "Jumlah budget harus lebih dari 0" },
        { status: 400 }
      );
    }

    const budget = await prisma.budget.upsert({
      where: {
        userId_bulan_tahun: {
          userId: user.id,
          bulan: bulan,
          tahun: tahun,
        },
      },
      update: {
        jumlah: jumlah,
      },
      create: {
        userId: user.id,
        bulan: bulan,
        tahun: tahun,
        jumlah: jumlah,
      },
    });

    return NextResponse.json({
      message: "Budget berhasil disimpan",
      budget,
    });
  } catch (error) {
    console.error("POST budget error:", error);

    return NextResponse.json(
      { message: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}