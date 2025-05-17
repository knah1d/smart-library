import express from 'express';
import { createUser, getUserById, updateUser } from '../controllers/userController.js';
import { validateUser } from '../middlewares/validation.js';

const router = express.Router();

// Routes
router.post('/', validateUser, createUser);
router.get('/:id', getUserById);
router.put('/:id', validateUser, updateUser);

export default router; 