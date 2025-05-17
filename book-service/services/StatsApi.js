import axios from "axios";
import dotenv from "dotenv";
import {
  createCircuitBreaker,
  createDefaultFallback,
} from "../utilities/circuitBreaker.js";

dotenv.config();

const STATS_SERVICE_URL =
  process.env.STATS_SERVICE_URL || "http://localhost:8084/api";

// Create an axios instance for stats-service
const statsApiClient = axios.create({
  baseURL: STATS_SERVICE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: process.env.API_TIMEOUT || 5000, // Default timeout 5 seconds
});

// Base function for updating book stats
const updateBookStatsFn = async (statsData) => {
  try {
    const response = await statsApiClient.post(
      `/stats/books/update`,
      statsData
    );
    return response.data;
  } catch (error) {
    throw new Error(`Error updating book stats: ${error.message}`);
  }
};

// Create circuit breaker for updateBookStats
const updateBookStatsBreaker = createCircuitBreaker(
  updateBookStatsFn,
  "updateBookStats",
  { timeout: 3000 }
);

// Define fallback for stats updates (non-critical operation)
updateBookStatsBreaker.fallback(
  createDefaultFallback("Stats service - updateBookStats", {
    status: "skipped",
    message: "Stats update skipped due to service unavailability",
  })
);

// Circuit-breaker wrapped function
export const updateBookStats = async (statsData) => {
  return updateBookStatsBreaker.fire(statsData);
};

// Health check function for stats service
export const checkStatsServiceHealth = async () => {
  try {
    const response = await statsApiClient.get("/health");
    return { status: "ok", message: "Stats service is healthy" };
  } catch (error) {
    return {
      status: "error",
      message: `Stats service health check failed: ${error.message}`,
    };
  }
};

export default {
  updateBookStats,
  checkStatsServiceHealth,
};
