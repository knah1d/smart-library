// API service for the Smart Library
const API_BASE_URL = 'http://localhost:5000/api';

// Stats API calls
export const statsAPI = {
  getSystemOverview: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/stats/overview`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching system overview:', error);
      throw error;
    }
  },
  
  getPopularBooks: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/stats/books/popular`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching popular books:', error);
      throw error;
    }
  }
};
