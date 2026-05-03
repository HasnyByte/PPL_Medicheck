const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const roleMiddleware = require("../middleware/role");
const screeningController = require("../controllers/screeningController");

router.get("/", authMiddleware, screeningController.getAll);
router.get("/user/:userId", authMiddleware, screeningController.getByUser);
router.post("/", authMiddleware, screeningController.create);
router.post("/predict", authMiddleware, roleMiddleware(["patient"]), screeningController.predict
);

module.exports = router;