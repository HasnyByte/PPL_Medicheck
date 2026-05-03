const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authMiddleware = require("../middleware/auth");
const roleMiddleware = require("../middleware/role");

// 🔥 hanya admin
router.get(
  "/admin-only",
  authMiddleware,
  roleMiddleware(["admin"]),
  (req, res) => {
    res.json({ message: "Halo Admin 🔥" });
  }
);

// 🔥 dokter + admin
router.get(
  "/doctor-only",
  authMiddleware,
  roleMiddleware(["doctor", "admin"]),
  (req, res) => {
    res.json({ message: "Halo Dokter/Admin 👨‍⚕️" });
  }
);

// 🔥 semua user login
router.get(
  "/me",
  authMiddleware,
  (req, res) => {
    res.json(req.user);
  }
);

router.post("/register", userController.register);
router.post("/login", userController.login);

module.exports = router;