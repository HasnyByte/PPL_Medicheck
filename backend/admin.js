const prisma = require("./src/prisma"); 
const bcrypt = require("bcrypt");

async function main() {
  // 🔐 hash password
  const adminPassword = await bcrypt.hash("admin123", 10);
  const doctorPassword = await bcrypt.hash("dokter123", 10);

  // 👑 CREATE ADMIN
  const admin = await prisma.user.upsert({
    where: { email: "admin@mail.com" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@mail.com",
      password: adminPassword,
      role: "admin",
    },
  });

  // 👨‍⚕️ CREATE DOCTOR
  const doctor = await prisma.user.upsert({
    where: { email: "dokter@mail.com" },
    update: {},
    create: {
      name: "Dr. Andi",
      email: "dokter@mail.com",
      password: doctorPassword,
      role: "doctor",
    },
  });

  console.log("✅ Admin:", admin.email);
  console.log("✅ Doctor:", doctor.email);
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });