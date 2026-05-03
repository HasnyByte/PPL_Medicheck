const screeningService = require("../services/screeningService");

const getAll = async (req, res) => {
  try {
    let data;

    if (req.user.role === "patient") {
      data = await screeningService.getByUser(req.user.userId);
    } else {
      data = await screeningService.getAll();
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getByUser = async (req, res) => {
  const { userId } = req.params;
  const data = await screeningService.getScreeningByUser(userId);
  res.json(data);
};

const create = async (req, res) => {
  try {
    const {
      disease,
      confidence,
      symptoms,
      specialist,
      specialistCode,
      isEmergency,
      tips,
    } = req.body;

    const data = await screeningService.createScreening({
      userId: req.user.userId,
      disease,
      confidence,
      symptoms,
      specialist,
      specialistCode,
      isEmergency,
      tips,
    });

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const predict = async (req, res) => {
  try {
    const { symptoms } = req.body;

    if (!symptoms) {
      return res.status(400).json({
        message: "Symptoms wajib diisi",
      });
    }

    const data = await screeningService.predictAndSave(
      req.user.userId,
      symptoms
    );

    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAll,
  getByUser,
  create,
  predict,
};