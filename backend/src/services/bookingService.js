const prisma = require("../prisma");

const createBooking = async (data) => {
  return await prisma.booking.create({
    data,
  });
};

const getAll = async () => {
  return await prisma.booking.findMany({
    include: { user: true },
  });
};

const getByUser = async (userId) => {
  return await prisma.booking.findMany({
    where: { userId },
  });
};

const updateStatus = async (id, status) => {
  return await prisma.booking.update({
    where: { id },
    data: { status },
  });
};

module.exports = {
  createBooking,
  getAll,
  getByUser,
  updateStatus,
};