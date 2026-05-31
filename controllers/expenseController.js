import Expense from "../models/Expense.js";



// CREATE EXPENSE
export const createExpense = async (req, res) => {

  try {

    const { type, amount, time, date } = req.body;

    const file = req.file
      ? req.file.filename
      : "";

    const expense = await Expense.create({
      type,
      amount,
      time,
      date,
      file,
    });

    res.status(201).json({
      success: true,
      message: "Expense Added",
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

// delete expenses 
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

