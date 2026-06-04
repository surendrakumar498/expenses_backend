import Expense from "../models/Expense.js";

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
    const expenses = await Expense.find().sort({
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

// DELETE

export const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;

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