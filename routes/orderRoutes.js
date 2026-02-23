import express from "express";
import Cart from "../models/Cart.js";
import Order from "../models/Order.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, async (req, res) => {
  try {
    const { shipping, paymentMethod = "cod" } = req.body;

    if (!shipping) {
      return res.status(400).json({ message: "Shipping details are required" });
    }

    const requiredFields = ["fullName", "email", "phone", "address", "city", "state", "zip"];
    const missing = requiredFields.find((field) => !shipping[field]);
    if (missing) {
      return res.status(400).json({ message: `${missing} is required` });
    }

    const cart = await Cart.findOne({ user: req.userId }).populate("items.product");

    if (!cart || !cart.items || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const validItems = cart.items.filter((item) => item.product);
    if (validItems.length === 0) {
      return res.status(400).json({ message: "No valid items in cart" });
    }

    const items = validItems.map((item) => ({
      product: item.product._id,
      name: item.product.name,
      image: item.product.image || "",
      category: item.product.category || "",
      price: Number(item.product.price) || 0,
      quantity: Number(item.quantity) || 1,
    }));

    const itemsPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const order = await Order.create({
      user: req.userId,
      items,
      shipping,
      paymentMethod,
      itemsPrice,
      totalPrice: itemsPrice,
    });

    cart.items = [];
    await cart.save();

    res.status(201).json(order);
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ message: "Failed to place order" });
  }
});

router.get("/my-orders", protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.userId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});

router.get("/:id", protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.user.toString() !== req.userId) {
      return res.status(403).json({ message: "Not authorized to view this order" });
    }

    res.json(order);
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ message: "Failed to fetch order" });
  }
});

export default router;
