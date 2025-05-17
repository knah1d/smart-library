import axios from "axios";

// Get service URL from environment variables with fallback
const USER_SERVICE_URL =
  process.env.USER_SERVICE_URL || "http://localhost:8081";

// Create a configured axios instance
const userServiceClient = axios.create({
  baseURL: USER_SERVICE_URL,
  timeout: 5000, // 5 seconds timeout
  headers: {
    "Content-Type": "application/json",
  },
});

// Add response interceptor for error handling
userServiceClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error("User service error:", error.message);
    throw error;
  }
);

/**
 * Get a user by their ID
 * @param {string} userId - The ID of the user to fetch
 * @returns {Promise<Object>} - The user data
 */
export const getUserById = async (userId) => {
  try {
    return await userServiceClient.get(`/users/${userId}`);
  } catch (error) {
    throw new Error(`Error fetching user: ${error.message}`);
  }
};

/**
 * Check if a user exists and can borrow books
 * @param {string} userId - The ID of the user to check
 * @returns {Promise<Object>} - The user status
 */
export const checkUserStatus = async (userId) => {
  try {
    return await userServiceClient.get(`/users/${userId}/status`);
  } catch (error) {
    throw new Error(`Error checking user status: ${error.message}`);
  }
};

/**
 * Update user loan count when a book is borrowed
 * @param {string} userId - The ID of the user
 * @returns {Promise<Object>} - The updated user data
 */
export const incrementUserLoanCount = async (userId) => {
  try {
    return await userServiceClient.put(`/users/${userId}/increment-loans`);
  } catch (error) {
    throw new Error(`Error updating user loan count: ${error.message}`);
  }
};

/**
 * Update user loan count when a book is returned
 * @param {string} userId - The ID of the user
 * @returns {Promise<Object>} - The updated user data
 */
export const decrementUserLoanCount = async (userId) => {
  try {
    return await userServiceClient.put(`/users/${userId}/decrement-loans`);
  } catch (error) {
    throw new Error(`Error updating user loan count: ${error.message}`);
  }
};

export default {
  getUserById,
  checkUserStatus,
  incrementUserLoanCount,
  decrementUserLoanCount,
};
