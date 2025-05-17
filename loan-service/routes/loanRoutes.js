import express from 'express';
import {
  createLoan,
  returnBook,
  getUserLoans,
  getOverdueLoans,
  extendLoan,
  updateLoan
} from '../controllers/loanController.js';
import { validateLoan, validateReturn } from '../middlewares/validation.js';

const router = express.Router();

// Routes
router.post('/', validateLoan, createLoan);
router.post('/returns', validateReturn, returnBook);
router.get('/overdue', getOverdueLoans);
router.get('/:userId', getUserLoans);
router.patch('/:id/update', updateLoan);
router.put('/:id/extend', extendLoan);

export default router; 