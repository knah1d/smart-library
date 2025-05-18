import axios from "axios";
import dotenv from "dotenv";
import {
  createCircuitBreaker,
  createDefaultFallback,
} from "../utilities/circuitBreaker.js";

dotenv.config();

const LOAN_SERVICE_URL =
  process.env.LOAN_SERVICE_URL || "http://localhost:8083/api";

// Create an axios instance for loan-service with improved timeout configuration
const loanApiClient = axios.create({
  baseURL: LOAN_SERVICE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: process.env.API_TIMEOUT || 5000, // 5 second timeout default
});

const getPopularBooksDataFn = async () => {
  try {
    const response = await loanApiClient.get("/api/loans/books/popular");
    return response.data;
  } catch (error) {
    throw new Error(`Error fetching popular books data: ${error.message}`);
  }
};
// Create circuit breaker for getPopularBooksData
const getPopularBooksDataBreaker = createCircuitBreaker(
  getPopularBooksDataFn,
  "getPopularBooksData",
  { timeout: 3000 } // Lower timeout for read operations
);
// Define fallback function
getPopularBooksDataBreaker.fallback(
  createDefaultFallback("Loan service - getPopularBooksData", null)
);
// Circuit-breaker wrapped function
export const getPopularBooksData = async () => {
  return getPopularBooksDataBreaker.fire();
};

const getActiveUsersDataFn = async () => {
  try {
    const response = await loanApiClient.get("/api/loans/active-users");
    return response.data;
  } catch (error) {
    throw new Error(`Error fetching active loans data: ${error.message}`);
  }
};
// Create circuit breaker for getActiveUsersData
const getActiveUsersDataBreaker = createCircuitBreaker(
  getActiveUsersDataFn,
  "getActiveUsersData",
  { timeout: 3000 } // Lower timeout for read operations
);
// Define fallback function
getActiveUsersDataBreaker.fallback(
  createDefaultFallback("Loan service - getActiveUsersData", null)
);
// Circuit-breaker wrapped function
export const getActiveUsersData = async () => {
  return getActiveUsersDataBreaker.fire();
};

const getLoanCountByStatusFn = async (status) => {
  try {
    const response = await loanApiClient.get(`/api/loans/count`, {
      params: { status },
    });
    return response.data;
  } catch (error) {
    throw new Error(`Error fetching loan count by status: ${error.message}`);
  }
};
// Create circuit breaker for getLoanCountByStatus
const getLoanCountByStatusBreaker = createCircuitBreaker(
  getLoanCountByStatusFn,
  "getLoanCountByStatus",
  { timeout: 3000 } // Lower timeout for read operations
);
// Define fallback function
getLoanCountByStatusBreaker.fallback(
  createDefaultFallback("Loan service - getLoanCountByStatus", null)
);
// Circuit-breaker wrapped function
export const getLoanCountByStatus = async (status) => {
  return getLoanCountByStatusBreaker.fire(status);
};

const getLoansTodayFn = async () => {
  try {
    const response = await loanApiClient.get("/api/loans/today");
    return response.data;
  } catch (error) {
    throw new Error(`Error fetching loans today: ${error.message}`);
  }
};
// Create circuit breaker for getLoansToday
const getLoansTodayBreaker = createCircuitBreaker(
  getLoansTodayFn,
  "getLoansToday",
  { timeout: 3000 } // Lower timeout for read operations
);
// Define fallback function
getLoansTodayBreaker.fallback(
  createDefaultFallback("Loan service - getLoansToday", null)
);
// Circuit-breaker wrapped function
export const getLoansToday = async () => {
  return getLoansTodayBreaker.fire();
};

const getReturnsTodayFn = async () => {
  try {
    const response = await loanApiClient.get("/api/loans/returns/today");
    return response.data;
  } catch (error) {
    throw new Error(`Error fetching returns today: ${error.message}`);
  }
};
// Create circuit breaker for getReturnsToday
const getReturnsTodayBreaker = createCircuitBreaker(
  getReturnsTodayFn,
  "getReturnsToday",
  { timeout: 3000 } // Lower timeout for read operations
);
// Define fallback function
getReturnsTodayBreaker.fallback(
  createDefaultFallback("Loan service - getReturnsToday", null)
);
// Circuit-breaker wrapped function
export const getReturnsToday = async () => {
  return getReturnsTodayBreaker.fire();
};
