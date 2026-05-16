const express = require("express");
const prisma = require("../prisma");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

// GET /api/screenings — admin only (all), doctor sees related, patient sees own
router.get("/", authenticate, async (req, res) => {
  try {
    let where = {};
    if (req.user.role === "patient") where.userId = req.user.id;
    const screenings = await prisma.screening.findMany({
      where, orderBy: { createdAt: "desc" }, take: 100,
      include: { user: { select: { id: true, name: true, email: true } } },
    });
    res.json(screenings);
  } catch (err) {
    res.status(500).json({ error: "Gagal mengambil data screening" });
  }
});

// GET /api/screenings/my — authenticated user's own screenings
router.get("/my", authenticate, async (req, res) => {
  try {
    const screenings = await prisma.screening.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
    });
    res.json(screenings);
  } catch (err) {
    res.status(500).json({ error: "Gagal mengambil riwayat screening" });
  }
});

// POST /api/screenings — create new screening record (called after AI analysis)
router.post("/", async (req, res) => {
  try {
    const { userId, disease, confidence, symptoms, specialist, specialistCode, isEmergency, tips, rawInput, severity, duration } = req.body;
    if (!disease || !symptoms) return res.status(400).json({ error: "disease dan symptoms wajib diisi" });

    const screening = await prisma.screening.create({
      data: {
        userId: userId || null,
        disease, confidence: confidence ? parseInt(confidence) : 0,
        symptoms, specialist: specialist || "Dokter Umum",
        specialistCode: specialistCode || "umum",
        isEmergency: isEmergency || false,
        tips: Array.isArray(tips) ? tips : [],
        rawInput: rawInput || null,
        severity: severity || null,
        duration: duration || null,
      },
    });
    res.status(201).json(screening);
  } catch (err) {
    console.error("Create screening error:", err);
    res.status(500).json({ error: "Gagal menyimpan hasil screening" });
  }
});

// DELETE /api/screenings/:id — user can delete their own
router.delete("/:id", authenticate, async (req, res) => {
  try {
    const screening = await prisma.screening.findUnique({ where: { id: req.params.id } });
    if (!screening) return res.status(404).json({ error: "Screening tidak ditemukan" });
    if (req.user.role !== "admin" && screening.userId !== req.user.id)
      return res.status(403).json({ error: "Akses ditolak" });
    await prisma.screening.delete({ where: { id: req.params.id } });
    res.json({ message: "Screening berhasil dihapus" });
  } catch (err) {
    res.status(500).json({ error: "Gagal menghapus screening" });
  }
});

module.exports = router;
