import express from "express";
import Product from "../models/Product.js";
import { protect, requireAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/admin", protect, requireAdmin, async (req, res) => {
  try {
    const { name, description = "", price, category, image = "" } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({ message: "Product name is required" });
    }

    if (!category?.trim()) {
      return res.status(400).json({ message: "Category is required" });
    }

    const parsedPrice = Number(price);
    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      return res.status(400).json({ message: "Price must be greater than 0" });
    }

    const product = await Product.create({
      name: name.trim(),
      description: description?.trim() || "",
      price: parsedPrice,
      category: category.trim(),
      image: image?.trim() || "",
    });

    return res.status(201).json(product);
  } catch (error) {
    console.error("Error creating product:", error);
    return res.status(500).json({ message: "Failed to create product" });
  }
});

router.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
    console.log("Products fetched successfully");
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Failed to fetch products", error: error.message });
  }
});

export default router;
