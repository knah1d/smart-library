import express from 'express';
import { body } from 'express-validator';
import {
  createBook,
  getBooks,
  getBookById,
  updateBook,
  deleteBook
} from '../controllers/bookController.js';

const router = express.Router();

// Validation middleware for creating a new book
const validateNewBook = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('author').trim().notEmpty().withMessage('Author is required'),
  body('isbn').trim().notEmpty().withMessage('ISBN is required'),
  body('copies').isInt({ min: 0 }).withMessage('Copies must be a non-negative number')
];

// Validation middleware for updating a book
const validateBookUpdate = [
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
  body('author').optional().trim().notEmpty().withMessage('Author cannot be empty'),
  body('isbn').optional().trim().notEmpty().withMessage('ISBN cannot be empty'),
  body('copies').optional().isInt({ min: 0 }).withMessage('Copies must be a non-negative number'),
  body('available_copies').optional().isInt({ min: 0 }).withMessage('Available copies must be a non-negative number')
];

// Routes
router.post('/', validateNewBook, createBook);
router.get('/', getBooks);
router.get('/:id', getBookById);
router.put('/:id', validateBookUpdate, updateBook);
router.delete('/:id', deleteBook);

export default router; 