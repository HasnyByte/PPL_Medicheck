const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../prisma");
const { authenticate, SECRET } = require("../middleware/auth");

const router = express.Router();

// POST /api/auth/register — patient
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ error: "Nama, email, dan password wajib diisi" });

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ error: "Email sudah terdaftar" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashed, role: "patient", phone: phone || null },
    });

    const token = jwt.sign({ id: user.id, name: user.name, email: user.email, role: user.role }, SECRET, { expiresIn: "7d" });
    res.status(201).json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone },
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Gagal mendaftar" });
  }
});

// POST /api/auth/register-doctor
router.post("/register-doctor", async (req, res) => {
  try {
    const { name, email, password, phone, specialist, specialistCode, hospital, hospitalAddress, bio, experience, education, licenseNumber, consultationFee } = req.body;

    if (!name || !email || !password || !specialist)
      return res.status(400).json({ error: "Nama, email, password, dan spesialis wajib diisi" });

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ error: "Email sudah terdaftar" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name, email, password: hashed, role: "doctor",
        phone: phone || null, specialist, specialistCode: specialistCode || null,
        hospital: hospital || null, hospitalAddress: hospitalAddress || null,
        bio: bio || null, experience: experience ? parseInt(experience) : null,
        education: education || null, licenseNumber: licenseNumber || null,
        consultationFee: consultationFee ? parseInt(consultationFee) : null,
      },
    });

    // Default schedule Mon-Fri
    await prisma.doctorSchedule.createMany({
      data: [1,2,3,4,5].map(day => ({
        doctorId: user.id, dayOfWeek: day, startTime: "08:00", endTime: "17:00", isActive: true,
      })),
    });

    const token = jwt.sign({ id: user.id, name: user.name, email: user.email, role: user.role }, SECRET, { expiresIn: "7d" });
    res.status(201).json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone, specialist: user.specialist, specialistCode: user.specialistCode, hospital: user.hospital },
    });
  } catch (err) {
    console.error("Doctor register error:", err);
    res.status(500).json({ error: "Gagal mendaftar dokter" });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email dan password wajib diisi" });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: "Email atau password salah" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: "Email atau password salah" });

    const token = jwt.sign({ id: user.id, name: user.name, email: user.email, role: user.role }, SECRET, { expiresIn: "7d" });
    res.json({
      token,
      user: {
        id: user.id, name: user.name, email: user.email, role: user.role,
        phone: user.phone, specialist: user.specialist, specialistCode: user.specialistCode,
        hospital: user.hospital, photoUrl: user.photoUrl,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Gagal login" });
  }
});

// GET /api/auth/me
router.get("/me", authenticate, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true, name: true, email: true, role: true, phone: true,
        specialist: true, specialistCode: true, hospital: true,
        hospitalAddress: true, bio: true, photoUrl: true,
        experience: true, education: true, licenseNumber: true,
        consultationFee: true, isVerified: true, createdAt: true,
        schedules: { orderBy: { dayOfWeek: "asc" } },
      },
    });
    if (!user) return res.status(404).json({ error: "User tidak ditemukan" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Gagal mengambil data user" });
  }
});

// PATCH /api/auth/profile
router.patch("/profile", authenticate, async (req, res) => {
  try {
    const { name, phone, specialist, specialistCode, hospital, hospitalAddress, bio, experience, education, licenseNumber, consultationFee, photoUrl } = req.body;
    const data = {};
    if (name !== undefined) data.name = name;
    if (phone !== undefined) data.phone = phone;
    if (specialist !== undefined) data.specialist = specialist;
    if (specialistCode !== undefined) data.specialistCode = specialistCode;
    if (hospital !== undefined) data.hospital = hospital;
    if (hospitalAddress !== undefined) data.hospitalAddress = hospitalAddress;
    if (bio !== undefined) data.bio = bio;
    if (experience !== undefined) data.experience = experience ? parseInt(experience) : null;
    if (education !== undefined) data.education = education;
    if (licenseNumber !== undefined) data.licenseNumber = licenseNumber;
    if (consultationFee !== undefined) data.consultationFee = consultationFee ? parseInt(consultationFee) : null;
    if (photoUrl !== undefined) data.photoUrl = photoUrl;

    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data,
      select: {
        id: true, name: true, email: true, role: true, phone: true,
        specialist: true, specialistCode: true, hospital: true,
        hospitalAddress: true, bio: true, photoUrl: true,
        experience: true, education: true, licenseNumber: true,
        consultationFee: true, isVerified: true,
        schedules: { orderBy: { dayOfWeek: "asc" } },
      },
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Gagal update profil" });
  }
});

// PATCH /api/auth/change-password
router.patch("/change-password", authenticate, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) return res.status(400).json({ error: "Password lama dan baru wajib diisi" });
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    const valid = await bcrypt.compare(oldPassword, user.password);
    if (!valid) return res.status(401).json({ error: "Password lama salah" });
    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: req.user.id }, data: { password: hashed } });
    res.json({ message: "Password berhasil diubah" });
  } catch (err) {
    res.status(500).json({ error: "Gagal ubah password" });
  }
});

module.exports = router;
