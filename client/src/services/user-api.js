// API service for the Smart Library
const API_BASE_URL = 'http://localhost:8081/api';

// User API calls
export const userAPI = {
  createUser: async (userData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      return await response.json();
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },
  
  getUser: async (userId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  },
  
  getUserByEmail: async (email) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users?email=${encodeURIComponent(email)}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching user by email:', error);
      throw error;
    }
  }
};