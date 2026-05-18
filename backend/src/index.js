const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

const authRoutes = require("./routes/auth");
const bookingRoutes = require("./routes/bookings");
const screeningRoutes = require("./routes/screenings");
const userRoutes = require("./routes/users");
const doctorRoutes = require("./routes/doctors");
const statsRoutes = require("./routes/stats");
const medicalRecordRoutes = require("./routes/medical-records");
const notificationRoutes = require("./routes/notifications");

const app = express();

app.use(cors({
  origin: [
    "http://localhost:3000",
    "http://localhost:3001",
    process.env.FRONTEND_URL || "http://localhost:3000",
  ],
  credentials: true,
}));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.get("/", (req, res) => res.json({ status: "MediCheck API running", version: "3.0.0" }));
app.get("/api", (req, res) => res.json({ status: "MediCheck API running", version: "3.0.0" }));
app.get("/api/health", (req, res) => res.json({ status: "healthy", timestamp: new Date().toISOString() }));

app.use("/api/auth", authRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/screenings", screeningRoutes);
app.use("/api/users", userRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/medical-records", medicalRecordRoutes);
app.use("/api/notifications", notificationRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal server error", message: err.message });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ Backend listening on http://localhost:${PORT}`);
});

module.exports = app;
