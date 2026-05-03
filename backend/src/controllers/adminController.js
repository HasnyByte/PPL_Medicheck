const { start } = require("node:repl");
const adminService = require("../services/adminService");

const getDashboard = async (req, res) => {
  try {
    const { start, end } = req.query;
    
    const data = await adminService.getDashboard(start, end);
    res.json(data);
  } catch (error) {
    console.error("Dashboard Error:", error);
    res.status(500).json({
      message: "Gagal ambil data dashboard",
      error: error.message,
    });
  }
};

module.exports = {
  getDashboard,
};