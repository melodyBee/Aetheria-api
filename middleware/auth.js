const { verify } = require("jsonwebtoken");

// Requires "Authorization: Bearer <token>" and puts the decoded token on req.user
const auth = (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: "Login required" });
  }

  try {
    req.user = verify(token, process.env.JWT_SECRET);
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

// Use after auth
const adminOnly = (req, res, next) => {
  if (String(req.user?.Role).toLowerCase() !== "admin") {
    return res.status(403).json({ message: "Admins only" });
  }
  next();
};

module.exports = { auth, adminOnly };
