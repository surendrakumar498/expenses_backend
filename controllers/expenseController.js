import Expense from "../models/Expense.js";

// CREATE EXPENSE
export const createExpense = async (req, res) => {
  try {

    const { type, amount, time, date } = req.body;

    // VALIDATION

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

    const file = req.file.filename;

    const expense = await Expense.create({
      type,
      amount,
      time,
      date,
      file,
    });

    res.status(201).json({
      success: true,
      message: "Expense Added Successfully",
      data: expense,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};


// GET ALL EXPENSES
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


// DELETE EXPENSE
export const deleteExpense = async (req, res) => {
  try {

    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Expense ID is required",
      });
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