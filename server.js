import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import expenseRoutes from "./routes/expenseRoutes.js";

dotenv.config();

const app = express();


// MIDDLEWARE
app.use(cors());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));


// STATIC FOLDER
app.use("/uploads", express.static("uploads"));


// ROUTES
app.use("/api/expenses", expenseRoutes);



// DATABASE CONNECTION
mongoose.connect(process.env.MONGO_URI)

.then(() => {
  console.log("MongoDB Connected Successfully");
})

.catch((err) => {
  console.log(err);
});



// SERVER
const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});