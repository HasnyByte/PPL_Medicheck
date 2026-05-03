const axios = require("axios");

const predictDisease = async (symptoms) => {
  // 🔁 mode dummy dulu
  if (process.env.USE_AI !== "true") {
    return {
      disease: "Flu",
      confidence: 85,
      specialist: "Dokter Umum",
      specialistCode: "DU",
      isEmergency: false,
      tips: ["Istirahat", "Minum air"],
    };
  }

  // 🔥 nanti kalau FastAPI sudah ada
  const response = await axios.post("http://localhost:8000/predict", {
    symptoms,
  });

  return response.data;
};

module.exports = {
  predictDisease,
};