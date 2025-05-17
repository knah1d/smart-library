import { body } from "express-validator";

// Validation middleware for creating a new book
export const validateNewBook = [
  body("title").trim().notEmpty().withMessage("Title is required"),
  body("author").trim().notEmpty().withMessage("Author is required"),
  body("isbn").trim().notEmpty().withMessage("ISBN is required"),
  body("copies")
    .isInt({ min: 0 })
    .withMessage("Copies must be a non-negative number"),
];

// Validation middleware for updating a book
export const validateBookUpdate = [
  body("title")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Title cannot be empty"),
  body("author")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Author cannot be empty"),
  body("isbn").optional().trim().notEmpty().withMessage("ISBN cannot be empty"),
  body("copies")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Copies must be a non-negative number"),
  body("available_copies")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Available copies must be a non-negative number"),
];

// Validation middleware for updating book availability
export const validateBookAvailability = [
  body("available_copies")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Available copies must be a non-negative number"),
  body("operation")
    .optional()
    .isIn(["increment", "decrement"])
    .withMessage('Operation must be either "increment" or "decrement"'),
];
