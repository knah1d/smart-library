import axios from "axios";
import dotenv from "dotenv";
import {
  createCircuitBreaker,
  createDefaultFallback,
} from "../utilities/circuitBreaker.js";

dotenv.config();

const USER_SERVICE_URL =
  process.env.USER_SERVICE_URL || "http://localhost:8081/api";

// Create an axios instance for user-service with improved timeout configuration
const userApiClient = axios.create({
  baseURL: USER_SERVICE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: process.env.API_TIMEOUT || 5000, // 5 second timeout default
});

// Base function for getting a user by ID
const getUserByIdFn = async (userId) => {
  try {
    const response = await userApiClient.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return null;
    }
    throw new Error(`Error fetching user: ${error.message}`);
  }
};

// Create circuit breaker for getUserById
const getUserByIdBreaker = createCircuitBreaker(
  getUserByIdFn,
  "getUserById",
  { timeout: 3000 } // Lower timeout for read operations
);

// Define fallback function
getUserByIdBreaker.fallback(
  createDefaultFallback("User service - getUserById", null)
);

// Circuit-breaker wrapped function
export const getUserById = async (userId) => {
  return getUserByIdBreaker.fire(userId);
};

// Health check function to verify user service is online
export const checkUserServiceHealth = async () => {
  try {
    const response = await userApiClient.get("/users?per_page=1");
    return { status: "ok", message: "User service is healthy" };
  } catch (error) {
    return {
      status: "error",
      message: `User service health check failed: ${error.message}`,
    };
  }
};

export default {
  getUserById,
  checkUserServiceHealth,
};
