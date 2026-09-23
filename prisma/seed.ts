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

  const passwordHash = await bcrypt.hash(
    "password123",
    10
  );


  await prisma.user.create({
    data: {
      nama: "Budi",
      email: "budi@gmail.com",
      passwordHash,
    },
  });


  console.log("Data berhasil dibuat");
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