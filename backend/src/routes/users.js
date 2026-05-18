const express = require("express");
const bcrypt = require("bcryptjs");
const prisma = require("../prisma");
const { authenticate, authorizeRoles } = require("../middleware/auth");

const router = express.Router();

// GET /api/users — admin only
router.get("/", authenticate, authorizeRoles("admin"), async (req, res) => {
  try {
    const { role, search } = req.query;
    const where = {};
    if (role) where.role = role;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }
    const users = await prisma.user.findMany({
      where,
      select: { id: true, name: true, email: true, role: true, phone: true, specialist: true, specialistCode: true, hospital: true, createdAt: true, updatedAt: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Gagal mengambil data user" });
  }
});

// GET /api/users/:id
router.get("/:id", authenticate, authorizeRoles("admin"), async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: { id: true, name: true, email: true, role: true, phone: true, specialist: true, specialistCode: true, hospital: true, createdAt: true },
    });
    if (!user) return res.status(404).json({ error: "User tidak ditemukan" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Gagal mengambil user" });
  }
});

// POST /api/users — admin create
router.post("/", authenticate, authorizeRoles("admin"), async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;
    if (!name || !email || !password || !role) return res.status(400).json({ error: "Data tidak lengkap" });
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ error: "Email sudah terdaftar" });
    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashed, role, phone: phone || null },
      select: { id: true, name: true, email: true, role: true, phone: true, createdAt: true },
    });
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ error: "Gagal membuat user" });
  }
});

// PATCH /api/users/:id — admin update
router.patch("/:id", authenticate, authorizeRoles("admin"), async (req, res) => {
  try {
    const { name, email, phone, role, password } = req.body;
    const data = {};
    if (name) data.name = name;
    if (email) data.email = email;
    if (phone !== undefined) data.phone = phone;
    if (role) data.role = role;
    if (password) data.password = await bcrypt.hash(password, 10);

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data,
      select: { id: true, name: true, email: true, role: true, phone: true, specialist: true, createdAt: true },
    });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Gagal update user" });
  }
});

// DELETE /api/users/:id — admin delete
router.delete("/:id", authenticate, authorizeRoles("admin"), async (req, res) => {
  try {
    if (req.params.id === req.user.id) return res.status(400).json({ error: "Tidak dapat menghapus akun sendiri" });
    await prisma.user.delete({ where: { id: req.params.id } });
    res.json({ message: "User berhasil dihapus" });
  } catch (err) {
    res.status(500).json({ error: "Gagal menghapus user" });
  }
});

module.exports = router;
