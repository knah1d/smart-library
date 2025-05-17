import express from "express";
import {
  createBook,
  getBooks,
  getBookById,
  updateBook,
  deleteBook,
  getPopularBooks,
  decreaseAvailabilityEndpoint,
  increaseAvailabilityEndpoint,
  updateBookAvailability,
} from "../controllers/bookController.js";
import {
  validateNewBook,
  validateBookUpdate,
  validateBookAvailability,
} from "../middlewares/validation.js";

const router = express.Router();

// Routes
router.post("/", validateNewBook, createBook);
router.get("/", getBooks);
router.get("/:id", getBookById);
router.put("/:id", validateBookUpdate, updateBook);
router.delete("/:id", deleteBook);

router.get("/stats/popular", getPopularBooks);

// Book availability endpoints
router.patch("/:id/decrease-availability", decreaseAvailabilityEndpoint);
router.patch("/:id/increase-availability", increaseAvailabilityEndpoint);
router.patch(
  "/:id/availability",
  validateBookAvailability,
  updateBookAvailability
);

export default router;
