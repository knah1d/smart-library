import { body } from 'express-validator';

// Validation middleware for loans
export const validateLoan = [
  body('user_id').notEmpty().withMessage('User ID is required'),
  body('book_id').notEmpty().withMessage('Book ID is required'),
  body('due_date').isISO8601().withMessage('Valid due date is required')
];

// Validation for return book
export const validateReturn = [
  body('loan_id').notEmpty().withMessage('Loan ID is required')
];
