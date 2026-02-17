import mongoose from "mongoose";

const cartSchema = new mongoose.Schema(
  {
    userId: String,
    items: [
      {
        productId: String,
        quantity: Number
      }
    ]
  },
  { timestamps: true }
);

export default mongoose.model("Cart", cartSchema);
