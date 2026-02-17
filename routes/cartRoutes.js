// routes/cartRoutes.js
import express from "express";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import { protect } from "../middleware/authMiddleware.js";


const router = express.Router();

// Get cart
router.get("/", protect, async (req, res) => {
  const cart = await Cart.findOne({ user: req.userId }).populate("items.product");
  res.json(cart ? cart.items : []);
});

// Add to cart
router.post("/add", protect, async (req, res) => {
  const { productId } = req.body;

  let cart = await Cart.findOne({ user: req.userId });

  if (!cart) {
    cart = new Cart({ user: req.userId, items: [] });
  }

  const itemIndex = cart.items.findIndex(
    (item) => item.product.toString() === productId
  );

  if (itemIndex > -1) {
    cart.items[itemIndex].quantity += 1;
  } else {
    cart.items.push({ product: productId, quantity: 1 });
  }

  await cart.save();
  res.json(cart.items);
});

// Increase quantity
router.put("/increase", protect, async (req, res) => {
  const { productId } = req.body;

  const cart = await Cart.findOne({ user: req.userId });
  const item = cart.items.find(i => i.product.toString() === productId);
  if (item) item.quantity += 1;

  await cart.save();
  res.json(cart.items);
});

// Decrease quantity
router.put("/decrease", protect, async (req, res) => {
  const { productId } = req.body;

  const cart = await Cart.findOne({ user: req.userId });
  cart.items = cart.items
    .map(i =>
      i.product.toString() === productId
        ? { ...i.toObject(), quantity: i.quantity - 1 }
        : i
    )
    .filter(i => i.quantity > 0);

  await cart.save();
  res.json(cart.items);
});

// Remove item
router.delete("/remove/:productId", protect, async (req, res) => {
  const { productId } = req.params;

  const cart = await Cart.findOne({ user: req.userId });
  cart.items = cart.items.filter(i => i.product.toString() !== productId);

  await cart.save();
  res.json(cart.items);
});

// Clear cart
router.delete("/clear", protect, async (req, res) => {
  await Cart.findOneAndUpdate({ user: req.userId }, { items: [] });
  res.json([]);
});

export default router;
