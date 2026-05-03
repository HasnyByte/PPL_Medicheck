const bookingService = require("../services/bookingService");

const getAll = async (req, res) => {
  try {
    let data;

    if (req.user.role === "patient") {
      data = await bookingService.getByUser(req.user.userId);
    } else {
      data = await bookingService.getAll();
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getByUser = async (req, res) => {
  const { userId } = req.params;
  const data = await bookingService.getBookingByUser(userId);
  res.json(data);
};

const create = async (req, res) => {
  try {
    const { doctor, date, time, disease, status } = req.body;

    const booking = await bookingService.createBooking({
      userId: req.user.userId,
      doctor,
      date: new Date(date),
      time,
      disease,
      status,
    });

    res.json(booking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const data = await bookingService.updateStatus(id, status);

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAll,
  getByUser,
  create,
  updateStatus,
};