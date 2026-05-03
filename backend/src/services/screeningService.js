const prisma = require("../prisma");
const aiService = require("./aiService");

const createScreening = async (data) => {
  return await prisma.screening.create({
    data,
  });
};

const getAllScreenings = async () => {
  return await prisma.screening.findMany();
};

const getScreeningByUser = async (userId) => {
  return await prisma.screening.findMany({
    where: { userId },
  });
};

const predictAndSave = async (userId, symptoms) => {
  const result = await aiService.predictDisease(symptoms);

  return await prisma.screening.create({
    data: {
      userId,
      disease: result.disease,
      confidence: result.confidence,
      symptoms,
      specialist: result.specialist,
      specialistCode: result.specialistCode,
      isEmergency: result.isEmergency,
      tips: result.tips,
    },
  });
};

module.exports = {
  createScreening,
  getAllScreenings,
  getScreeningByUser,
  predictAndSave,
};