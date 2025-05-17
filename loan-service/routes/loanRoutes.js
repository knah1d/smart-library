import express from "express";
import {
  createLoan,
  returnBook,
  getUserLoans,
  getOverdueLoans,
  extendLoan,
  updateLoan,
  getLoanById,
} from "../controllers/loanController.js";
import { validateLoan, validateReturn } from "../middlewares/validation.js";

const router = express.Router();

// Routes
router.post("/", validateLoan, createLoan);
router.post("/returns", validateReturn, returnBook);
router.get("/overdue", getOverdueLoans);
router.get("/user/:userId", getUserLoans); // Get loans for a specific user by their ID
router.get("/:id", getLoanById);
router.patch("/:id/update", updateLoan);
router.put("/:id/extend", extendLoan);

export default router;
