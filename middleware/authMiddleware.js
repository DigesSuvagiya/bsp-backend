import jwt from "jsonwebtoken";

export const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId || null;
    req.role = decoded.role || (decoded.userId ? "user" : null);
    next();
  } catch (error) {
    return res.status(401).json({ message: "Not authorized, token failed" });
  }
};

export const requireRole = (...allowedRoles) => (req, res, next) => {
  if (!req.role || !allowedRoles.includes(req.role)) {
    return res.status(403).json({ message: "Forbidden: insufficient role" });
  }

  next();
};

export const requireAdmin = requireRole("admin");
export const requireUser = requireRole("user");
