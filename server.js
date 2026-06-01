import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import expenseRoutes from "./routes/expenseRoutes.js";

dotenv.config();

const app = express();

// Middleware
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static Folder
app.use("/uploads", express.static("uploads"));

// Test Route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Expense API Running Successfully",
  });
});

// API Routes
app.use("/api/expenses", expenseRoutes);

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected Successfully");
  })
  .catch((err) => {
    console.log("MongoDB Error:", err);
  });

// Local Development Only
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 8000;

  app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
  });
}

export default app;