import express from "express";
import { checkHealth } from "../controllers/healthController.js";

const router = express.Router();

// Health check endpoint
router.get("/", checkHealth);

export default router;
