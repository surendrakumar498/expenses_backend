import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema({

  type: {
    type: String,
    required: true,
  },

  amount: {
    type: String,
    required: true,
  },

  time: {
    type: String,
    required: true,
  },

  date: {
    type: String,
    required: true,
  },

  file: {
    type: String,
  },

  public_id: {
    type: String,
  },

}, { timestamps: true });

export default mongoose.model("Expense", expenseSchema);