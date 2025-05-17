import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const BOOK_SERVICE_URL =
  process.env.BOOK_SERVICE_URL || "http://localhost:8082/api";

// Create an axios instance for book-service
const bookApiClient = axios.create({
  baseURL: BOOK_SERVICE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Service functions that mirror the functions in bookController.js
export const getBookById = async (bookId) => {
  try {
    const response = await bookApiClient.get(`/books/${bookId}`);
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return null;
    }
    throw new Error(`Error fetching book: ${error.message}`);
  }
};

export const decreaseBookAvailability = async (bookId) => {
  try {
    const response = await bookApiClient.patch(
      `/books/${bookId}/decrease-availability`
    );
    return response.data;
  } catch (error) {
    throw new Error(`Error decreasing book availability: ${error.message}`);
  }
};

export const increaseBookAvailability = async (bookId) => {
  try {
    const response = await bookApiClient.patch(
      `/books/${bookId}/increase-availability`
    );
    return response.data;
  } catch (error) {
    throw new Error(`Error increasing book availability: ${error.message}`);
  }
};

export default {
  getBookById,
  decreaseBookAvailability,
  increaseBookAvailability,
};
