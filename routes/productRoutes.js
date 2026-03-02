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

router.put("/admin/:id", protect, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description = "", price, category } = req.body;

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

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    product.name = name.trim();
    product.description = description?.trim() || "";
    product.price = parsedPrice;
    product.category = category.trim();
    // Intentionally keep product.image unchanged.

    await product.save();

    return res.json(product);
  } catch (error) {
    console.error("Error updating product:", error);
    return res.status(500).json({ message: "Failed to update product" });
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
