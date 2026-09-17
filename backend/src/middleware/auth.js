const jwt = require("jsonwebtoken");

function authMiddleware(req, _res, next) {
  const header = req.headers.authorization;
  if (!header) return next({ status: 401, isOperational: true, message: "No token provided" });

  const token = header.startsWith("Bearer ") ? header.slice(7) : header;
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    next({ status: 401, isOperational: true, message: "Invalid or expired token" });
  }
}

module.exports = { authMiddleware };
