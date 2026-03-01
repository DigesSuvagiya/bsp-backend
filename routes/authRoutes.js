import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { protect, requireAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

const signAuthToken = ({ userId, role }) =>
  jwt.sign(
    {
      ...(userId ? { userId } : {}),
      role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

router.post("/signup", async (req, res) => {
  try {
    const { name, age, number, password } = req.body;
    const adminNumber = process.env.ADMIN_NUMBER;

    if (!number || !password) {
      return res.status(400).json({ message: "Number and password are required" });
    }

    if (adminNumber && number === adminNumber) {
      return res.status(400).json({ message: "This number is reserved" });
    }

    const userExists = await User.findOne({ number });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      name,
      age,
      number,
      password: hashedPassword,
    });

    res.status(201).json({ message: "Signup successful" });
  } catch (error) {
    res.status(500).json({ message: "Signup failed" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { number, password } = req.body;

    if (!number || !password) {
      return res.status(400).json({ message: "Number and password are required" });
    }

    const adminNumber = process.env.ADMIN_NUMBER;
    const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;

    if (adminNumber && number === adminNumber) {
      if (!adminPasswordHash) {
        return res.status(500).json({ message: "Admin auth is not configured" });
      }

      const adminPasswordMatches = await bcrypt.compare(password, adminPasswordHash);
      if (!adminPasswordMatches) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      const token = signAuthToken({ role: "admin" });
      return res.json({
        message: "Login successful",
        token,
        role: "admin",
      });
    }

    const user = await User.findOne({ number });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = signAuthToken({ userId: user._id.toString(), role: "user" });

    return res.json({
      message: "Login successful",
      token,
      role: "user",
    });
  } catch (err) {
    return res.status(500).json({ message: "Login failed" });
  }
});

router.get("/admin/verify", protect, requireAdmin, (req, res) => {
  res.json({
    message: "Admin verified",
    role: req.role,
  });
});

export default router;
