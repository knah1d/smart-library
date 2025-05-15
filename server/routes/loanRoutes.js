import express from 'express';
import { body } from 'express-validator';
import {
  createLoan,
  returnBook,
  getUserLoans,
  getOverdueLoans,
  extendLoan,
  updateLoan
} from '../controllers/loanController.js';

const router = express.Router();

// Validation middleware
const validateLoan = [
  body('user_id').notEmpty().withMessage('User ID is required'),
  body('book_id').notEmpty().withMessage('Book ID is required'),
  body('due_date').isISO8601().withMessage('Valid due date is required')
];

// Validation for return book
const validateReturn = [
  body('loan_id').notEmpty().withMessage('Loan ID is required')
];

// Routes
router.post('/', validateLoan, createLoan);
router.post('/returns', validateReturn, returnBook);
router.get('/overdue', getOverdueLoans);
router.get('/:userId', getUserLoans);
router.patch('/:id/update', updateLoan);
router.put('/:id/extend', extendLoan);

export default router; 