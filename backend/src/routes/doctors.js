const express = require("express");
const prisma = require("../prisma");
const { authenticate, authorizeRoles } = require("../middleware/auth");

const router = express.Router();

const DOCTOR_SELECT = {
  id: true, name: true, email: true, phone: true,
  specialist: true, specialistCode: true, hospital: true, hospitalAddress: true,
  bio: true, photoUrl: true, experience: true, education: true,
  licenseNumber: true, consultationFee: true, isVerified: true,
  schedules: { where: { isActive: true }, orderBy: { dayOfWeek: "asc" } },
};

// GET /api/doctors — public listing with optional specialist filter
router.get("/", async (req, res) => {
  try {
    const { specialist, specialistCode, search } = req.query;
    const where = { role: "doctor" };
    if (specialistCode) where.specialistCode = { contains: specialistCode, mode: "insensitive" };
    else if (specialist) where.specialist = { contains: specialist, mode: "insensitive" };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { specialist: { contains: search, mode: "insensitive" } },
        { hospital: { contains: search, mode: "insensitive" } },
      ];
    }
    const doctors = await prisma.user.findMany({ where, select: DOCTOR_SELECT, orderBy: { name: "asc" } });
    res.json(doctors);
  } catch (err) {
    console.error("Get doctors error:", err);
    res.status(500).json({ error: "Gagal mengambil daftar dokter" });
  }
});

// GET /api/doctors/me/appointments — Doctor's own appointments
router.get("/me/appointments", authenticate, authorizeRoles("doctor"), async (req, res) => {
  try {
    const { status, date } = req.query;
    const where = { doctorId: req.user.id };
    if (status && status !== "Semua") where.status = status;
    if (date) {
      const d = new Date(date);
      const nextDay = new Date(d); nextDay.setDate(d.getDate() + 1);
      where.date = { gte: d, lt: nextDay };
    }
    const bookings = await prisma.booking.findMany({
      where,
      select: {
        id: true, userId: true, doctorId: true, date: true, time: true,
        disease: true, status: true, notes: true, createdAt: true, updatedAt: true,
        user: { select: { id: true, name: true, email: true, phone: true, createdAt: true } },
        medicalRecord: { select: { id: true, diagnosis: true, prescription: true, notes: true, followUpDate: true } },
      },
      orderBy: [{ date: "desc" }, { time: "asc" }],
    });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: "Gagal mengambil janji temu" });
  }
});

// GET /api/doctors/me/patients — Unique patients for this doctor
router.get("/me/patients", authenticate, authorizeRoles("doctor"), async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: { doctorId: req.user.id },
      select: { userId: true, user: { select: { id: true, name: true, email: true, phone: true, createdAt: true } } },
      distinct: ["userId"],
    });
    const patients = bookings.map(b => b.user).filter(Boolean);
    res.json(patients);
  } catch (err) {
    res.status(500).json({ error: "Gagal mengambil daftar pasien" });
  }
});

// PUT /api/doctors/me/schedule — Update doctor's schedule
router.put("/me/schedule", authenticate, authorizeRoles("doctor"), async (req, res) => {
  try {
    const { schedules } = req.body;
    if (!Array.isArray(schedules)) return res.status(400).json({ error: "schedules harus berupa array" });

    // Delete existing schedules then recreate
    await prisma.doctorSchedule.deleteMany({ where: { doctorId: req.user.id } });
    const created = await prisma.doctorSchedule.createMany({
      data: schedules.map(s => ({
        doctorId: req.user.id,
        dayOfWeek: parseInt(s.dayOfWeek),
        startTime: s.startTime,
        endTime: s.endTime,
        isActive: s.isActive !== false,
      })),
    });
    const result = await prisma.doctorSchedule.findMany({
      where: { doctorId: req.user.id }, orderBy: { dayOfWeek: "asc" },
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Gagal update jadwal" });
  }
});

// GET /api/doctors/:id — Public doctor profile
router.get("/:id", async (req, res) => {
  try {
    const doctor = await prisma.user.findUnique({
      where: { id: req.params.id, role: "doctor" },
      select: DOCTOR_SELECT,
    });
    if (!doctor) return res.status(404).json({ error: "Dokter tidak ditemukan" });
    res.json(doctor);
  } catch (err) {
    res.status(500).json({ error: "Gagal mengambil profil dokter" });
  }
});

module.exports = router;
