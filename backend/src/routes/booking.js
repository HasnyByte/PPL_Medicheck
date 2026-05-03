const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const roleMiddleware = require("../middleware/role");
const bookingController = require("../controllers/bookingController");

router.get("/", authMiddleware, bookingController.getAll);
router.get("/user/:userId", authMiddleware, bookingController.getByUser);
router.post("/", authMiddleware, roleMiddleware(["patient", "admin"]), bookingController.create);
router.put("/:id/status", authMiddleware, roleMiddleware(["doctor", "admin"]), bookingController.updateStatus);

module.exports = router;