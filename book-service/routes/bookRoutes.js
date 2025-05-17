import express from 'express';
import {
  createBook,
  getBooks,
  getBookById,
  updateBook,
  deleteBook,
  getPopularBooks
} from '../controllers/bookController.js';
import { validateNewBook, validateBookUpdate } from '../middlewares/validation.js';

const router = express.Router();

// Routes
router.post('/', validateNewBook, createBook);
router.get('/', getBooks);
router.get('/:id', getBookById);
router.put('/:id', validateBookUpdate, updateBook);
router.delete('/:id', deleteBook);
router.get('/popular', getPopularBooks);

export default router; 