import Expense from "../models/Expense.js";
import cloudinary from "../config/cloudinaryConfig.js";

// CREATE EXPENSE

export const createExpense = async (req, res) => {
  try {
    const { type, amount, time, date } = req.body;

    if (
      !type ||
      !amount ||
      !time ||
      !date ||
      !req.file
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const expense = await Expense.create({
      type,
      amount,
      time,
      date,
      file: req.file.path, // Cloudinary URL
      public_id: req.file.filename, // Cloudinary public_id (update ke time delete ke liye zaroori)
    });

    res.status(201).json({
      success: true,
      message: "Expense Added Successfully",
      data: expense,
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET ALL

export const getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({}).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      data: expenses,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// UPDATE

export const updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, time, date } = req.body;

    const expense = await Expense.findById(id);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      });
    }

    if (amount !== undefined && amount !== "") expense.amount = amount;
    if (time !== undefined && time !== "") expense.time = time;
    if (date !== undefined && date !== "") expense.date = date;

    if (req.file) {
      // Purani Cloudinary file delete karo (agar thi)
      if (expense.public_id) {
        await cloudinary.uploader.destroy(expense.public_id);
      }

      expense.file = req.file.path;
      expense.public_id = req.file.filename;
    }

    await expense.save();

    return res.status(200).json({
      success: true,
      message: "Expense updated successfully",
      data: expense,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// DELETE

export const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;

    const expense = await Expense.findById(id);

    if (expense && expense.public_id) {
      await cloudinary.uploader.destroy(expense.public_id);
    }

    await Expense.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Expense Deleted Successfully",
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};