import jwt from "jsonwebtoken";

export const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Check token exists
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;   // 👈 available in next routes
    next();
  } catch (error) {
    return res.status(401).json({ message: "Not authorized, token failed" });
  }
};
