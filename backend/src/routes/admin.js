const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth");
const roleMiddleware = require("../middleware/role");
const adminController = require("../controllers/adminController");

router.use(authMiddleware, roleMiddleware(["admin"]));

router.get("/dashboard", adminController.getDashboard);

module.exports = router;