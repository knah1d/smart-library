import express from "express";
import {
  createLoan,
  returnBook,
  getUserLoans,
  getOverdueLoans,
  extendLoan,
  updateLoan,
  getLoanById,
  getPopularBooksData,
  getActiveUsersData,
  getLoanCountByStatus,
  getLoansToday,
  getReturnsToday,
} from "../controllers/loanController.js";
import { validateLoan, validateReturn } from "../middlewares/validation.js";

const router = express.Router();
//stats routes
router.get("/books/popular", getPopularBooksData);
router.get("/active-users", getActiveUsersData);
router.get("/count", getLoanCountByStatus);
router.get("/today", getLoansToday);
router.get("/returns/today", getReturnsToday);

// Routes
router.post("/", validateLoan, createLoan);
router.post("/returns", validateReturn, returnBook);
router.get("/overdue", getOverdueLoans);
router.get("/user/:userId", getUserLoans); // Get loans for a specific user by their ID
router.get("/:id", getLoanById);
router.patch("/:id/update", updateLoan);
router.put("/:id/extend", extendLoan);

export default router;
