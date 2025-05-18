import express from "express";
import {
  createUser,
  getUserById,
  updateUser,
  getUserByEmail,
  getActiveUsers,
  countUsers,
} from "../controllers/userController.js";
import { validateUser } from "../middlewares/validation.js";

const router = express.Router();

// Routes
router.post("/", validateUser, createUser);
router.get("/", getUserByEmail);

router.get("/count", countUsers);
router.get("/active", getActiveUsers);
router.get("/:id", getUserById);
router.patch("/:id", validateUser, updateUser);

export default router;
