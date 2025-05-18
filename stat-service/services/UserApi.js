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


// Base function for counting users
const countUsersFn = async () => {
  try {
    const response = await userApiClient.get("/users/count");
    return response.data;
  } catch (error) {
    throw new Error(`Error fetching user count: ${error.message}`);
  }
}
// Create circuit breaker for countUsers
const countUsersBreaker = createCircuitBreaker(
  countUsersFn,
  "countUsers",
  { timeout: 3000 } // Lower timeout for read operations
);
// Define fallback function
countUsersBreaker.fallback(
  createDefaultFallback("User service - countUsers", null)
);
// Circuit-breaker wrapped function
export const countUsers = async () => {
  return countUsersBreaker.fire();
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
  countUsers,
  checkUserServiceHealth,
};
