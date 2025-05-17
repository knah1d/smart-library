// API service for the Smart Library
const API_BASE_URL = "http://localhost:8082/api";

// Book API calls
export const bookAPI = {
  getBooks: async (search = "", page = 1, perPage = 10) => {
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (page) params.append("page", page);
      if (perPage) params.append("per_page", perPage);

      const response = await fetch(
        `${API_BASE_URL}/books?${params.toString()}`
      );
      return await response.json();
    } catch (error) {
      console.error("Error fetching books:", error);
      throw error;
    }
  },

  getBookById: async (bookId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/books/${bookId}`);
      return await response.json();
    } catch (error) {
      console.error("Error fetching book:", error);
      throw error;
    }
  },

  createBook: async (bookData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/books`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookData),
      });
      return await response.json();
    } catch (error) {
      console.error("Error creating book:", error);
      throw error;
    }
  },

  updateBookAvailability: async (bookId, availableCopies, operation) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/books/${bookId}/availability`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            available_copies: availableCopies,
            operation,
          }),
        }
      );
      return await response.json();
    } catch (error) {
      console.error("Error updating book availability:", error);
      throw error;
    }
  },
};
