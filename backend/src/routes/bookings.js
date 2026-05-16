const express = require("express");
const prisma = require("../prisma");
const { authenticate, authorizeRoles } = require("../middleware/auth");

const router = express.Router();

const BOOKING_SELECT = {
  id: true, userId: true, doctorId: true, date: true, time: true,
  disease: true, status: true, notes: true, createdAt: true, updatedAt: true,
  user: { select: { id: true, name: true, email: true, phone: true, createdAt: true } },
  doctor: { select: { id: true, name: true, specialist: true, hospital: true, photoUrl: true } },
  medicalRecord: {
    select: { id: true, diagnosis: true, prescription: true, notes: true, followUpDate: true, createdAt: true }
  },
};

// GET /api/bookings — for patient: their own, for admin: all
router.get("/", authenticate, async (req, res) => {
  try {
    const where = req.user.role === "admin" ? {} : req.user.role === "doctor"
      ? { doctorId: req.user.id }
      : { userId: req.user.id };
    const bookings = await prisma.booking.findMany({
      where, select: BOOKING_SELECT, orderBy: { date: "desc" },
    });
    res.json(bookings);
  } catch (err) {
    console.error("Get bookings error:", err);
    res.status(500).json({ error: "Gagal mengambil data booking" });
  }
});

// GET /api/bookings/:id
router.get("/:id", authenticate, async (req, res) => {
  try {
    const booking = await prisma.booking.findUnique({ where: { id: req.params.id }, select: BOOKING_SELECT });
    if (!booking) return res.status(404).json({ error: "Booking tidak ditemukan" });
    if (req.user.role !== "admin" && booking.userId !== req.user.id && booking.doctorId !== req.user.id)
      return res.status(403).json({ error: "Akses ditolak" });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: "Gagal mengambil booking" });
  }
});

// POST /api/bookings
router.post("/", authenticate, async (req, res) => {
  try {
    const { doctorId, date, time, disease, notes } = req.body;
    if (!doctorId || !date || !time || !disease)
      return res.status(400).json({ error: "doctorId, date, time, dan disease wajib diisi" });

    const doctor = await prisma.user.findUnique({ where: { id: doctorId, role: "doctor" } });
    if (!doctor) return res.status(404).json({ error: "Dokter tidak ditemukan" });

    const userId = req.user.id;

    // Check duplicate booking
    const existing = await prisma.booking.findFirst({
      where: { doctorId, userId, date: new Date(date), time, status: { in: ["Menunggu", "Terkonfirmasi"] } },
    });
    if (existing) return res.status(409).json({ error: "Anda sudah memiliki booking pada waktu yang sama" });

    const booking = await prisma.booking.create({
      data: { userId, doctorId, date: new Date(date), time, disease, notes: notes || null },
      select: BOOKING_SELECT,
    });

    // Notification to patient
    await prisma.notification.create({
      data: {
        userId,
        title: "Booking Berhasil Dibuat",
        message: `Booking Anda dengan ${doctor.name} pada ${new Date(date).toLocaleDateString("id-ID")} pukul ${time} sedang menunggu konfirmasi.`,
        type: "info",
      },
    });

    // Notification to doctor
    await prisma.notification.create({
      data: {
        userId: doctorId,
        title: "Janji Temu Baru",
        message: `Pasien baru ingin konsultasi pada ${new Date(date).toLocaleDateString("id-ID")} pukul ${time} mengenai: ${disease}`,
        type: "info",
      },
    });

    res.status(201).json(booking);
  } catch (err) {
    console.error("Create booking error:", err);
    res.status(500).json({ error: "Gagal membuat booking" });
  }
});

// PATCH /api/bookings/:id/status — doctor or admin
router.patch("/:id/status", authenticate, async (req, res) => {
  try {
    const { status } = req.body;
    const valid = ["Menunggu", "Terkonfirmasi", "Selesai", "Dibatalkan"];
    if (!valid.includes(status)) return res.status(400).json({ error: "Status tidak valid" });

    const booking = await prisma.booking.findUnique({ where: { id: req.params.id }, select: BOOKING_SELECT });
    if (!booking) return res.status(404).json({ error: "Booking tidak ditemukan" });

    if (req.user.role !== "admin" && booking.doctorId !== req.user.id)
      return res.status(403).json({ error: "Hanya dokter terkait yang dapat mengubah status" });

    const updated = await prisma.booking.update({
      where: { id: req.params.id }, data: { status }, select: BOOKING_SELECT,
    });

    // Notify patient
    const statusMsg = {
      Terkonfirmasi: "Janji temu Anda telah dikonfirmasi oleh dokter.",
      Selesai: "Konsultasi Anda telah selesai.",
      Dibatalkan: "Maaf, janji temu Anda dibatalkan oleh dokter.",
    };
    if (statusMsg[status]) {
      await prisma.notification.create({
        data: {
          userId: booking.userId,
          title: `Booking ${status}`,
          message: `${statusMsg[status]} Keluhan: ${booking.disease}`,
          type: status === "Dibatalkan" ? "warning" : "success",
        },
      });
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Gagal update status booking" });
  }
});

// PATCH /api/bookings/:id/cancel — patient cancel their own
router.patch("/:id/cancel", authenticate, async (req, res) => {
  try {
    const booking = await prisma.booking.findUnique({ where: { id: req.params.id } });
    if (!booking) return res.status(404).json({ error: "Booking tidak ditemukan" });
    if (booking.userId !== req.user.id) return res.status(403).json({ error: "Akses ditolak" });
    if (!["Menunggu", "Terkonfirmasi"].includes(booking.status))
      return res.status(400).json({ error: "Booking tidak dapat dibatalkan" });

    const updated = await prisma.booking.update({
      where: { id: req.params.id }, data: { status: "Dibatalkan" }, select: BOOKING_SELECT,
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Gagal membatalkan booking" });
  }
});

// DELETE /api/bookings/:id — admin only
router.delete("/:id", authenticate, authorizeRoles("admin"), async (req, res) => {
  try {
    await prisma.booking.delete({ where: { id: req.params.id } });
    res.json({ message: "Booking berhasil dihapus" });
  } catch (err) {
    res.status(500).json({ error: "Gagal menghapus booking" });
  }
});

module.exports = router;
