import express from 'express';
import { body } from 'express-validator';
import { createUser, getUserById, updateUser } from '../controllers/userController.js';

const router = express.Router();

// Validation middleware
const validateUser = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('role').isIn(['student', 'faculty']).withMessage('Role must be either student or faculty')
];

// Routes
router.post('/', validateUser, createUser);
router.get('/:id', getUserById);
router.patch('/:id', validateUser, updateUser);

export default router; 