// API service for the Smart Library
const API_BASE_URL = 'http://localhost:8082/api';

// Book API calls
export const bookAPI = {
  getBooks: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/books`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching books:', error);
      throw error;
    }
  },
  
  getBookById: async (bookId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/books/${bookId}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching book:', error);
      throw error;
    }
  },
  
  createBook: async (bookData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/books`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookData)
      });
      return await response.json();
    } catch (error) {
      console.error('Error creating book:', error);
      throw error;
    }
  }
};
