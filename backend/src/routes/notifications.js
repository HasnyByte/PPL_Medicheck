const express = require("express");
const prisma = require("../prisma");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

// GET /api/notifications — get user's notifications
router.get("/", authenticate, async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: "Gagal mengambil notifikasi" });
  }
});

// PATCH /api/notifications/:id/read
router.patch("/:id/read", authenticate, async (req, res) => {
  try {
    const notif = await prisma.notification.findUnique({ where: { id: req.params.id } });
    if (!notif || notif.userId !== req.user.id) return res.status(403).json({ error: "Akses ditolak" });
    await prisma.notification.update({ where: { id: req.params.id }, data: { isRead: true } });
    res.json({ message: "Notifikasi ditandai dibaca" });
  } catch (err) {
    res.status(500).json({ error: "Gagal update notifikasi" });
  }
});

// PATCH /api/notifications/read-all
router.patch("/read-all", authenticate, async (req, res) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user.id, isRead: false },
      data: { isRead: true },
    });
    res.json({ message: "Semua notifikasi ditandai dibaca" });
  } catch (err) {
    res.status(500).json({ error: "Gagal update notifikasi" });
  }
});

module.exports = router;
