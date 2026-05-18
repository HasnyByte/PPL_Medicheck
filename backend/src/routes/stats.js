const express = require("express");
const prisma = require("../prisma");
const { authenticate, authorizeRoles } = require("../middleware/auth");

const router = express.Router();

// GET /api/stats — admin stats
router.get("/", authenticate, authorizeRoles("admin"), async (req, res) => {
  try {
    const [users, bookings, screenings] = await Promise.all([
      prisma.user.groupBy({ by: ["role"], _count: { id: true } }),
      prisma.booking.groupBy({ by: ["status"], _count: { id: true } }),
      prisma.screening.count(),
    ]);

    const totalUsers = users.reduce((s, u) => s + u._count.id, 0);
    const doctors = users.find(u => u.role === "doctor")?._count.id || 0;
    const patients = users.find(u => u.role === "patient")?._count.id || 0;
    const totalBookings = bookings.reduce((s, b) => s + b._count.id, 0);
    const pendingBookings = bookings.find(b => b.status === "Menunggu")?._count.id || 0;

    // Recent bookings for chart (last 7 days)
    const sevenDaysAgo = new Date(); sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentBookings = await prisma.booking.findMany({
      where: { createdAt: { gte: sevenDaysAgo } },
      select: { createdAt: true, status: true },
    });

    res.json({
      totalUsers, totalBookings, totalScreenings: screenings,
      pendingBookings, doctors, patients,
      bookingsByStatus: bookings.map(b => ({ status: b.status, count: b._count.id })),
      recentBookings,
    });
  } catch (err) {
    console.error("Admin stats error:", err);
    res.status(500).json({ error: "Gagal mengambil statistik" });
  }
});

// GET /api/stats/doctor — Doctor's own stats (CRITICAL: isolated per doctor)
router.get("/doctor", authenticate, authorizeRoles("doctor"), async (req, res) => {
  try {
    const doctorId = req.user.id; // Only this doctor's data

    const [statusGroups, uniquePatientsRaw, recordsCount, todayBookings] = await Promise.all([
      prisma.booking.groupBy({
        by: ["status"],
        where: { doctorId },
        _count: { id: true },
      }),
      prisma.booking.findMany({
        where: { doctorId },
        select: { userId: true },
        distinct: ["userId"],
      }),
      prisma.medicalRecord.count({ where: { doctorId } }),
      prisma.booking.count({
        where: {
          doctorId,
          date: {
            gte: new Date(new Date().setHours(0,0,0,0)),
            lt: new Date(new Date().setHours(23,59,59,999)),
          },
        },
      }),
    ]);

    const total = statusGroups.reduce((s, g) => s + g._count.id, 0);
    const pending = statusGroups.find(g => g.status === "Menunggu")?._count.id || 0;
    const confirmed = statusGroups.find(g => g.status === "Terkonfirmasi")?._count.id || 0;
    const done = statusGroups.find(g => g.status === "Selesai")?._count.id || 0;
    const cancelled = statusGroups.find(g => g.status === "Dibatalkan")?._count.id || 0;

    res.json({
      total, pending, confirmed, done, cancelled,
      uniquePatients: uniquePatientsRaw.length,
      todayAppointments: todayBookings,
      totalRecords: recordsCount,
    });
  } catch (err) {
    console.error("Doctor stats error:", err);
    res.status(500).json({ error: "Gagal mengambil statistik dokter" });
  }
});

module.exports = router;
