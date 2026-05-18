const express = require("express");
const prisma = require("../prisma");
const { authenticate, authorizeRoles } = require("../middleware/auth");

const router = express.Router();

const RECORD_SELECT = {
  id: true, bookingId: true, patientId: true, doctorId: true,
  diagnosis: true, prescription: true, notes: true, followUpDate: true,
  createdAt: true, updatedAt: true,
  patient: { select: { id: true, name: true, email: true, phone: true } },
  doctor: { select: { id: true, name: true, specialist: true } },
  booking: { select: { id: true, date: true, time: true, disease: true, status: true } },
};

// GET /api/medical-records — role-based access
router.get("/", authenticate, async (req, res) => {
  try {
    let where = {};
    if (req.user.role === "doctor") where.doctorId = req.user.id;
    else if (req.user.role === "patient") where.patientId = req.user.id;
    // admin: all records

    const records = await prisma.medicalRecord.findMany({
      where, select: RECORD_SELECT, orderBy: { createdAt: "desc" },
    });
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: "Gagal mengambil rekam medis" });
  }
});

// GET /api/medical-records/:id
router.get("/:id", authenticate, async (req, res) => {
  try {
    const record = await prisma.medicalRecord.findUnique({ where: { id: req.params.id }, select: RECORD_SELECT });
    if (!record) return res.status(404).json({ error: "Rekam medis tidak ditemukan" });
    if (req.user.role !== "admin" && record.doctorId !== req.user.id && record.patientId !== req.user.id)
      return res.status(403).json({ error: "Akses ditolak" });
    res.json(record);
  } catch (err) {
    res.status(500).json({ error: "Gagal mengambil rekam medis" });
  }
});

// POST /api/medical-records — doctor only
router.post("/", authenticate, authorizeRoles("doctor"), async (req, res) => {
  try {
    const { bookingId, diagnosis, prescription, notes, followUpDate } = req.body;
    if (!bookingId || !diagnosis) return res.status(400).json({ error: "bookingId dan diagnosis wajib diisi" });

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId }, select: { id: true, doctorId: true, userId: true, disease: true },
    });
    if (!booking) return res.status(404).json({ error: "Booking tidak ditemukan" });
    if (booking.doctorId !== req.user.id) return res.status(403).json({ error: "Anda tidak dapat membuat rekam medis untuk booking ini" });

    // Check if record already exists
    const existing = await prisma.medicalRecord.findUnique({ where: { bookingId } });
    if (existing) return res.status(409).json({ error: "Rekam medis untuk booking ini sudah ada" });

    const record = await prisma.medicalRecord.create({
      data: {
        bookingId, patientId: booking.userId, doctorId: req.user.id,
        diagnosis, prescription: prescription || null, notes: notes || null,
        followUpDate: followUpDate ? new Date(followUpDate) : null,
      },
      select: RECORD_SELECT,
    });

    // Update booking status to Selesai
    await prisma.booking.update({ where: { id: bookingId }, data: { status: "Selesai" } });

    // Notify patient
    await prisma.notification.create({
      data: {
        userId: booking.userId,
        title: "Rekam Medis Tersedia",
        message: `Dokter telah membuat rekam medis untuk konsultasi Anda. Diagnosis: ${diagnosis}`,
        type: "success",
      },
    });

    res.status(201).json(record);
  } catch (err) {
    console.error("Create record error:", err);
    res.status(500).json({ error: "Gagal membuat rekam medis" });
  }
});

// PATCH /api/medical-records/:id — doctor update
router.patch("/:id", authenticate, authorizeRoles("doctor"), async (req, res) => {
  try {
    const { diagnosis, prescription, notes, followUpDate } = req.body;
    const record = await prisma.medicalRecord.findUnique({ where: { id: req.params.id } });
    if (!record) return res.status(404).json({ error: "Rekam medis tidak ditemukan" });
    if (record.doctorId !== req.user.id) return res.status(403).json({ error: "Akses ditolak" });

    const updated = await prisma.medicalRecord.update({
      where: { id: req.params.id },
      data: {
        ...(diagnosis !== undefined && { diagnosis }),
        ...(prescription !== undefined && { prescription }),
        ...(notes !== undefined && { notes }),
        ...(followUpDate !== undefined && { followUpDate: followUpDate ? new Date(followUpDate) : null }),
      },
      select: RECORD_SELECT,
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Gagal update rekam medis" });
  }
});

// DELETE /api/medical-records/:id — admin only
router.delete("/:id", authenticate, authorizeRoles("admin"), async (req, res) => {
  try {
    await prisma.medicalRecord.delete({ where: { id: req.params.id } });
    res.json({ message: "Rekam medis berhasil dihapus" });
  } catch (err) {
    res.status(500).json({ error: "Gagal menghapus rekam medis" });
  }
});

module.exports = router;
