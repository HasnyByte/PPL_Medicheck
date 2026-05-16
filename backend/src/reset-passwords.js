/**
 * Reset semua password ke default. Jalankan jika lupa password atau seed bermasalah.
 * Usage: node src/reset-passwords.js
 */
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
require("dotenv").config();
const prisma = new PrismaClient();

async function main() {
  console.log("🔑 Mereset semua password...\n");

  const accounts = [
    { email: "admin@medicheck.id", password: "admin123", role: "admin" },
    { email: "pasien@medicheck.id", password: "pasien123", role: "patient" },
    { email: "rizky.jantung@medicheck.id", password: "dokter123", role: "doctor" },
    { email: "siti.paru@medicheck.id", password: "dokter123", role: "doctor" },
    { email: "budi.saraf@medicheck.id", password: "dokter123", role: "doctor" },
    { email: "lestari.pd@medicheck.id", password: "dokter123", role: "doctor" },
    { email: "ahmad.kulit@medicheck.id", password: "dokter123", role: "doctor" },
    { email: "nuraini.anak@medicheck.id", password: "dokter123", role: "doctor" },
    { email: "hendra.umum@medicheck.id", password: "dokter123", role: "doctor" },
    { email: "maya.tht@medicheck.id", password: "dokter123", role: "doctor" },
  ];

  for (const acc of accounts) {
    const hashed = await bcrypt.hash(acc.password, 10);
    const user = await prisma.user.findUnique({ where: { email: acc.email } });
    if (user) {
      await prisma.user.update({ where: { email: acc.email }, data: { password: hashed } });
      console.log(`✅ ${acc.role.padEnd(7)} | ${acc.email.padEnd(35)} → ${acc.password}`);
    } else {
      console.log(`⚠️  Tidak ditemukan: ${acc.email} (jalankan seed dulu)`);
    }
  }

  console.log("\n✅ Selesai! Coba login kembali.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
