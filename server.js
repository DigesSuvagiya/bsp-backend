import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/dbc.js";

 import authRoutes from "./routes/authRoutes.js";
 import productRoutes from "./routes/productRoutes.js";
 import cartRoutes from "./routes/cartRoutes.js";    

dotenv.config();
connectDB();

const app = express();

// app.use(cors({
//   origin: "https://bytespark-personal-care.vercel.app",
// }));

app.use(cors()); 

app.use(express.json());

 app.use("/api/auth", authRoutes);
 app.use("/api/products", productRoutes);
 app.use("/api/cart", cartRoutes);

app.get("/", (req, res) => {
  res.send("Bytespark Backend Running");
});

app.listen(process.env.PORT, () =>
  console.log(`Server running on port ${process.env.PORT}`)
);
