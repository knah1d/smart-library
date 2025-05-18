import axios from "axios";
import dotenv from "dotenv";
import {
  createCircuitBreaker,
  createDefaultFallback,
} from "../utilities/circuitBreaker.js";

dotenv.config();

const BOOK_SERVICE_URL =
  process.env.BOOK_SERVICE_URL || "http://localhost:8082/api";

// Create an axios instance for book-service with improved timeouts
const bookApiClient = axios.create({
  baseURL: BOOK_SERVICE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: process.env.API_TIMEOUT || 5000, // 5 second timeout default
});

const getBookStatsFn = async () => {
  try {
    const response = await bookApiClient.get("/books/stats");
    return response.data;
  } catch (error) {
    throw new Error(`Error fetching book stats: ${error.message}`);
  }
};
// Create circuit breaker for getBookStats
const getBookStatsBreaker = createCircuitBreaker(
  getBookStatsFn,
  "getBookStats",
  { timeout: 3000 } // Lower timeout for read operations
);
// Define fallback function
getBookStatsBreaker.fallback(
  createDefaultFallback("Book service - getBookStats", null)
);
// Circuit-breaker wrapped function
export const getBookStats = async () => {
  return getBookStatsBreaker.fire();
};

// Health check function to verify book service is online
export const checkBookServiceHealth = async () => {
  try {
    const response = await bookApiClient.get("/books?per_page=1");
    return { status: "ok", message: "Book service is healthy" };
  } catch (error) {
    return {
      status: "error",
      message: `Book service health check failed: ${error.message}`,
    };
  }
};

export default {
  getBookStats,
  checkBookServiceHealth,
};
