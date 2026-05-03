const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // cek apakah ada token
  if (!authHeader) {
    return res.status(401).json({ message: "Token tidak ada" });
  }

  // ambil token (format: Bearer TOKEN)
  const token = authHeader.split(" ")[1];

  try {
    // verifikasi token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // simpan data user ke request
    req.user = decoded;

    next(); // lanjut ke route
  } catch (error) {
    return res.status(401).json({ message: "Token tidak valid" });
  }
};

module.exports = authMiddleware;