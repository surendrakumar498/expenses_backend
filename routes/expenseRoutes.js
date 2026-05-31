import express from "express";
import multer from "multer";
import path from "path";

import {
  createExpense,
  getExpenses,
  deleteExpense,
} from "../controllers/expenseController.js";

const router = express.Router();


// ================= MULTER STORAGE =================

const storage = multer.diskStorage({

  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },

  filename: function (req, file, cb) {

    cb(
      null,
      Date.now() + "-" + file.originalname
    );

  },

});

const upload = multer({ storage });


// ================= CREATE =================

router.post(
  "/create",
  upload.single("file"),
  createExpense
);


// ================= GET ALL =================

router.get(
  "/all",
  getExpenses
);


// ================= DELETE =================

router.delete(
  "/delete/:id",
  deleteExpense
);


// ================= DOWNLOAD FILE =================

router.get(
  "/download/:filename",
  (req, res) => {

    const fileName = req.params.filename;

    const filePath = path.join(
      process.cwd(),
      "uploads",
      fileName
    );

    res.download(filePath);

  }
);

export default router;