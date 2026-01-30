import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

const router = express.Router();


router.post("/signup", async (req, res) => {
  try {
    const { name, age, number, password } = req.body;

    
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

    const user = await User.findOne({ number });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }


    res.json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        age: user.age,
        number: user.number,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Login failed" });
  }
});

export default router;
