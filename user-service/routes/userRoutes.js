import express from "express";
import {
  createUser,
  getUserById,
  updateUser,
  getUserByEmail,
  getActiveUsers,
  countUsers
} from "../controllers/userController.js";
import { validateUser } from "../middlewares/validation.js";

const router = express.Router();

// Routes
router.post("/", validateUser, createUser);
router.get("/:id", getUserById);
router.get("/", getUserByEmail);
router.get("/count", countUsers);
router.patch("/:id", validateUser, updateUser);
router.get("/active", getActiveUsers);

export default router;
