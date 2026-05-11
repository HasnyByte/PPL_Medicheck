const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend Medicheck jalan 🚀");
});

const prisma = require("./prisma");

app.get("/test-db", async (req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});

const userRoutes = require("./routes/user");

app.use("/api/users", userRoutes);

const bookingRoutes = require("./routes/booking");

app.use("/api/bookings", bookingRoutes);

const screeningRoutes = require("./routes/screening");

app.use("/api/screenings", screeningRoutes);

const adminRoutes = require("./routes/admin");

app.use("/api/admin", adminRoutes); 

if (process.env.NODE_ENV !== 'production') {
  app.listen(5000, () => {
    console.log("Server running on port 5000");
  });
}

module.exports = app;