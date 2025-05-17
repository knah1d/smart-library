import { getActiveUsers } from "../../../user-service/controllers/userController";

// API service for the Smart Library
const API_BASE_URL1 = 'http://localhost:8081/api';
const API_BASE_URL2 = 'http://localhost:8082/api';

// Stats API calls
export const statsAPI = {
  // getSystemOverview: async () => {
  //   try {
  //     const response = await fetch(`${API_BASE_URL1}/stats/overview`);
  //     return await response.json();
  //   } catch (error) {
  //     console.error('Error fetching system overview:', error);
  //     throw error;
  //   }
  // },
  
  getPopularBooks: async () => {
    try {
      const response = await fetch(`${API_BASE_URL2}/books/popular`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching popular books:', error);
      throw error;
    }
  },

  getActiveUsers: async () => {
    try {
      const response = await fetch(`${API_BASE_URL1}/active`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching active users:', error);
      throw error;
    }
  }
};
