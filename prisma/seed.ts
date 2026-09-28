import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcrypt";
import "dotenv/config";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  // Buat user contoh
  const passwordHash = await bcrypt.hash(
    "password123",
    10
  );

  const user = await prisma.user.upsert({
    where: {
      email: "budi@gmail.com",
    },
    update: {},
    create: {
      nama: "Budi",
      email: "budi@gmail.com",
      passwordHash,
    },
  });

  // Buat kategori
  const categories = [
    { nama: "Makanan", jenis: "pengeluaran" },
    { nama: "Transportasi", jenis: "pengeluaran" },
    { nama: "Pendidikan", jenis: "pengeluaran" },
    { nama: "Belanja", jenis: "pengeluaran" },
    { nama: "Hiburan", jenis: "pengeluaran" },
    { nama: "Gaji", jenis: "pemasukan" },
    { nama: "Freelance", jenis: "pemasukan" },
    { nama: "Bonus", jenis: "pemasukan" },
  ];

  for (const category of categories) {
    const existing = await prisma.category.findFirst({
      where: {
        nama: category.nama,
      },
    });

    if (existing) {
      await prisma.category.update({
        where: {
          id: existing.id,
        },
        data: {
          jenis: category.jenis,
        },
      });
    } else {
      await prisma.category.create({
        data: category,
      });
    }
  }

  // Buat budget bulan September 2026
  await prisma.budget.upsert({
    where: {
      userId_bulan_tahun: {
        userId: user.id,
        bulan: 9,
        tahun: 2026,
      },
    },
    update: {
      jumlah: 1000000,
    },
    create: {
      userId: user.id,
      bulan: 9,
      tahun: 2026,
      jumlah: 1000000,
    },
  });

  console.log("Data user, kategori, dan budget berhasil dibuat");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });