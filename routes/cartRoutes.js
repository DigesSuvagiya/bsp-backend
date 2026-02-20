// routes/cartRoutes.js
import express from "express";
import Cart from "../models/Cart.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// helper: get populated cart items
const getPopulatedItems = async (userId) => {
  const cart = await Cart.findOne({ user: userId }).populate("items.product");
  return cart ? cart.items : [];
};

// Get cart
router.get("/", protect, async (req, res) => {
  const items = await getPopulatedItems(req.userId);
  res.json(items);
});

// Add to cart
router.post("/add", protect, async (req, res) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ message: "productId is required" });
    }

    let cart = await Cart.findOne({ user: req.userId });
    if (!cart) {
      cart = new Cart({ user: req.userId, items: [] });
    }

    const item = cart.items.find(
      (i) => i.product && i.product.toString() === productId
    );

    if (item) {
      item.quantity += 1;
    } else {
      cart.items.push({ product: productId, quantity: 1 });
    }

    await cart.save();

    const items = await getPopulatedItems(req.userId);
    res.json(items);
  } catch (error) {
    console.error("Error in /cart/add:", error);
    res.status(500).json({ message: "Failed to add to cart" });
  }
});

// Increase quantity
router.put("/increase", protect, async (req, res) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ message: "productId is required" });
    }

    const cart = await Cart.findOne({ user: req.userId });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const item = cart.items.find(
      (i) => i.product && i.product.toString() === productId
    );

    if (!item) {
      // Clean up any items with undefined products
      cart.items = cart.items.filter((i) => i.product);
      await cart.save();
      return res.status(404).json({ message: "Item not found in cart" });
    }

    item.quantity += 1;

    await cart.save();

    const items = await getPopulatedItems(req.userId);
    res.json(items);
  } catch (error) {
    console.error("Error in /cart/increase:", error);
    res.status(500).json({ message: "Failed to increase quantity" });
  }
});

// Decrease quantity
router.put("/decrease", protect, async (req, res) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ message: "productId is required" });
    }

    const cart = await Cart.findOne({ user: req.userId });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const item = cart.items.find(
      (i) => i.product && i.product.toString() === productId
    );

    if (!item) {
      // Clean up any items with undefined products
      cart.items = cart.items.filter((i) => i.product);
      await cart.save();
      return res.status(404).json({ message: "Item not found in cart" });
    }

    item.quantity -= 1;

    if (item.quantity <= 0) {
      cart.items = cart.items.filter(
        (i) => !i.product || i.product.toString() !== productId
      );
    }

    await cart.save();

    const items = await getPopulatedItems(req.userId);
    res.json(items);
  } catch (error) {
    console.error("Error in /cart/decrease:", error);
    res.status(500).json({ message: "Failed to decrease quantity" });
  }
});

// Remove item
router.delete("/remove/:productId", protect, async (req, res) => {
  try {
    const { productId } = req.params;

    if (!productId) {
      return res.status(400).json({ message: "productId is required" });
    }

    const cart = await Cart.findOne({ user: req.userId });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const exists = cart.items.some(
      (i) => i.product && i.product.toString() === productId
    );

    if (!exists) {
      // Clean up any items with undefined products
      cart.items = cart.items.filter((i) => i.product);
      await cart.save();
      return res.status(404).json({ message: "Item not found in cart" });
    }

    cart.items = cart.items.filter(
      (i) => !i.product || i.product.toString() !== productId
    );

    await cart.save();

    const items = await getPopulatedItems(req.userId);
    res.json(items);
  } catch (error) {
    console.error("Error in /cart/remove:", error);
    res.status(500).json({ message: "Failed to remove item" });
  }
});

// Clear cart
router.delete("/clear", protect, async (req, res) => {
  await Cart.findOneAndUpdate({ user: req.userId }, { items: [] });

  // ✅ return populated (empty) items
  res.json([]);
});

export default router;