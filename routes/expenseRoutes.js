import express from "express";
import multer from "multer";
import path from "path";

import {
  createExpense,
  getExpenses,
  updateExpense,
  deleteExpense,
} from "../controllers/expenseController.js";

const router = express.Router();

//  MULTER STORAGE

import cloudinary from "../config/cloudinaryConfig.js";

import { CloudinaryStorage } from "multer-storage-cloudinary";

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "expenses",
    resource_type: "auto",
  },
});

const upload = multer({ storage });

// CREATE

router.post(
  "/create",
  upload.single("file"),
  createExpense
);

router.get(
  "/all",
  getExpenses
);

// UPDATE

router.put(
  "/update/:id",
  upload.single("file"),
  updateExpense
);

router.delete(
  "/delete/:id",
  deleteExpense
);

// DOWNLOAD FILE

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