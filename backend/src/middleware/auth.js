const jwt = require("jsonwebtoken");
const SECRET = process.env.JWT_SECRET || "medicheck_secret_key_change_in_prod";

function authenticate(req, res, next) {
  const header = req.headers["authorization"];
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token tidak ditemukan" });
  }
  const token = header.slice(7);
  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Token tidak valid atau kadaluarsa" });
  }
}

function authorizeRoles(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user?.role)) {
      return res.status(403).json({ error: "Akses ditolak" });
    }
    next();
  };
}

module.exports = { authenticate, authorizeRoles, SECRET };
