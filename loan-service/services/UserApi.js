import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const USER_SERVICE_URL =
  process.env.USER_SERVICE_URL || "http://localhost:8081/api";

// Create an axios instance for user-service
const userApiClient = axios.create({
  baseURL: USER_SERVICE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 5000, // Set a timeout for requests
});

// Service functions that mirror the functions in userController.js
export const getUserById = async (userId) => {
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

export default {
  getUserById,
};
