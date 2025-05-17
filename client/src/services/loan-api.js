// API service for the Smart Library
const API_BASE_URL = 'http://localhost:8083/api';


// Loan API calls
export const loanAPI = {
  createLoan: async (loanData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/loans`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loanData)
      });
      return await response.json();
    } catch (error) {
      console.error('Error creating loan:', error);
      throw error;
    }
  },
  
  getUserLoans: async (userId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/loans/${userId}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching user loans:', error);
      throw error;
    }
  },
  
  returnBook: async (loanId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/loans/returns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loan_id: loanId })
      });
      return await response.json();
    } catch (error) {
      console.error('Error returning book:', error);
      throw error;
    }
  }
};