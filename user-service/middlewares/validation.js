import { body } from 'express-validator';

// Validation middleware for users
export const validateUser = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('role').isIn(['student', 'faculty']).withMessage('Role must be either student or faculty')
];
