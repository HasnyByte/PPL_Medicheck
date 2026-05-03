const prisma = require("../prisma");

const getDashboard = async (start, end) => {
  const totalUsers = await prisma.user.count();

  const totalPatients = await prisma.user.count({
    where: { role: "patient" },
  });

  const totalDoctors = await prisma.user.count({
    where: { role: "doctor" },
  });

  const totalBookings = await prisma.booking.count();

  const pendingBookings = await prisma.booking.count({
    where: { status: "pending" },
  });

  const statusGroup = await prisma.booking.groupBy({
    by: ["status"],
    _count: { status: true },
  });

  const bookingStatus = {
    pending: 0,
    confirmed: 0,
    done: 0,
    cancelled: 0,
  };

  statusGroup.forEach((item) => {
    bookingStatus[item.status] = item._count.status;
  });

  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    last7Days.push(d.toISOString().split("T")[0]);
  }

  const weeklyActivity = await Promise.all(
    last7Days.map(async (date) => {
      const start = new Date(date);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);

      const bookingCount = await prisma.booking.count({
        where: {
          createdAt: {
            gte: start,
            lte: end,
          },
        },
      });

      const screeningCount = await prisma.screening.count({
        where: {
          createdAt: {
            gte: start,
            lte: end,
          },
        },
      });

      return {
        date,
        booking: bookingCount,
        screening: screeningCount,
      };
    })
  );

  const userGrowth = await Promise.all(
    last7Days.map(async (date) => {
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);

      const total = await prisma.user.count({
        where: {
          createdAt: {
            lte: end,
          },
        },
      });

      return {
        date,
        total,
      };
    })
  );

  return {
    cards: {
      totalUsers,
      totalPatients,
      totalDoctors,
      totalBookings,
      pendingBookings,
    },
    bookingStatus,
    weeklyActivity,
    userGrowth,
  };
};

module.exports = {
  getDashboard,
};