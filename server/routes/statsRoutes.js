import express from 'express';
import {
  getPopularBooks,
  getActiveUsers,
  getSystemOverview
} from '../controllers/statsController.js';

const router = express.Router();

// Routes
router.get('/books/popular', getPopularBooks);
router.get('/users/active', getActiveUsers);
router.get('/overview', getSystemOverview);

export default router; 