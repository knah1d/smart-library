// API service for the Smart Library Stats
const STAT_SERVICE_URL = "http://localhost/api";

// Stats API calls
export const statsAPI = {
  getSystemOverview: async () => {
    try {
      const response = await fetch(`${STAT_SERVICE_URL}/stats/overview`);
      return await response.json();
    } catch (error) {
      console.error("Error fetching system overview:", error);
      throw error;
    }
  },

  getPopularBooks: async () => {
    try {
      const response = await fetch(`${STAT_SERVICE_URL}/stats/books/popular`);
      return await response.json();
    } catch (error) {
      console.error("Error fetching popular books:", error);
      throw error;
    }
  },

  getActiveUsers: async () => {
    try {
      const response = await fetch(`${STAT_SERVICE_URL}/stats/users/active`);
      return await response.json();
    } catch (error) {
      console.error("Error fetching active users:", error);
      throw error;
    }
  },
};
