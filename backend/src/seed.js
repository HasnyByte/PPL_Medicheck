const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Admin — force update password on every seed
  const adminPass = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@medicheck.id" },
    update: { password: adminPass, role: "admin", name: "Admin MediCheck" },
    create: { name: "Admin MediCheck", email: "admin@medicheck.id", password: adminPass, role: "admin", phone: "081200000000" },
  });
  console.log("✅ Admin:", admin.email, "| password reset to: admin123");

  // Doctors — force update password on every seed
  const doctorPass = await bcrypt.hash("dokter123", 10);
  const doctorsData = [
    { name: "Dr. Rizky Pratama, Sp.JP", specialist: "Dokter Jantung", specialistCode: "jantung", hospital: "RS Jantung Harapan Kita", email: "rizky.jantung@medicheck.id", bio: "Spesialis jantung berpengalaman 12 tahun", experience: 12, education: "FK Universitas Indonesia", licenseNumber: "STR-JP-2012-001", consultationFee: 250000 },
    { name: "Dr. Siti Aminah, Sp.P", specialist: "Dokter Paru", specialistCode: "paru", hospital: "RSUP Persahabatan", email: "siti.paru@medicheck.id", bio: "Spesialis paru dan pernapasan", experience: 8, education: "FK Universitas Airlangga", licenseNumber: "STR-P-2016-002", consultationFee: 200000 },
    { name: "Dr. Budi Santoso, Sp.N", specialist: "Dokter Saraf", specialistCode: "saraf", hospital: "RSHS Bandung", email: "budi.saraf@medicheck.id", bio: "Spesialis neurologi dan saraf", experience: 10, education: "FK Universitas Padjadjaran", licenseNumber: "STR-N-2014-003", consultationFee: 220000 },
    { name: "Dr. Lestari Dewi, Sp.PD", specialist: "Dokter Penyakit Dalam", specialistCode: "penyakit_dalam", hospital: "RSCM Jakarta", email: "lestari.pd@medicheck.id", bio: "Spesialis penyakit dalam komprehensif", experience: 15, education: "FK Universitas Indonesia", licenseNumber: "STR-PD-2009-004", consultationFee: 230000 },
    { name: "Dr. Ahmad Fauzi, Sp.KK", specialist: "Dokter Kulit", specialistCode: "kulit", hospital: "RS Dermata", email: "ahmad.kulit@medicheck.id", bio: "Spesialis kulit dan kelamin", experience: 7, education: "FK Universitas Diponegoro", licenseNumber: "STR-KK-2017-005", consultationFee: 180000 },
    { name: "Dr. Nur Aini, Sp.A", specialist: "Dokter Anak", specialistCode: "anak", hospital: "RSAB Harapan Kita", email: "nuraini.anak@medicheck.id", bio: "Spesialis anak dan tumbuh kembang", experience: 9, education: "FK Universitas Brawijaya", licenseNumber: "STR-A-2015-006", consultationFee: 190000 },
    { name: "Dr. Hendra Wijaya", specialist: "Dokter Umum", specialistCode: "umum", hospital: "Klinik Sehat Bersama", email: "hendra.umum@medicheck.id", bio: "Dokter umum dengan pendekatan holistik", experience: 5, education: "FK Universitas Gadjah Mada", licenseNumber: "STR-U-2019-007", consultationFee: 100000 },
    { name: "Dr. Maya Putri, Sp.THT", specialist: "Dokter THT", specialistCode: "tht", hospital: "RS THT Bandung", email: "maya.tht@medicheck.id", bio: "Spesialis THT", experience: 11, education: "FK Universitas Hasanuddin", licenseNumber: "STR-THT-2013-008", consultationFee: 210000 },
  ];

  for (const d of doctorsData) {
    const doc = await prisma.user.upsert({
      where: { email: d.email },
      update: { password: doctorPass, role: "doctor" }, // always reset password
      create: { ...d, password: doctorPass, role: "doctor", isVerified: true, hospitalAddress: "Jakarta, Indonesia", phone: "081200000001" },
    });
    const existing = await prisma.doctorSchedule.count({ where: { doctorId: doc.id } });
    if (existing === 0) {
      await prisma.doctorSchedule.createMany({
        data: [1,2,3,4,5].map(day => ({ doctorId: doc.id, dayOfWeek: day, startTime: "08:00", endTime: "17:00", isActive: true })),
      });
    }
    console.log("✅ Doctor:", doc.name);
  }

  // Sample patient — force update password
  const patientPass = await bcrypt.hash("pasien123", 10);
  await prisma.user.upsert({
    where: { email: "pasien@medicheck.id" },
    update: { password: patientPass, role: "patient" },
    create: { name: "Budi Santoso", email: "pasien@medicheck.id", password: patientPass, role: "patient", phone: "081234567890" },
  });
  console.log("✅ Sample patient seeded");

  console.log("\n🎉 Seeding complete! Password semua akun sudah di-reset:");
  console.log("   Admin:   admin@medicheck.id       → admin123");
  console.log("   Dokter:  rizky.jantung@medicheck.id → dokter123");
  console.log("   Pasien:  pasien@medicheck.id       → pasien123");
}

main().catch(console.error).finally(() => prisma.$disconnect());
