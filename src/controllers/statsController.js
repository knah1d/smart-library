import { getBookStats } from './bookController.js';
import { countUsers } from './userController.js';
import { 
  getPopularBooksData, 
  getActiveUsersData, 
  getLoanCountByStatus, 
  getLoansToday, 
  getReturnsToday 
} from './loanController.js';

// Get popular books
export const getPopularBooks = async (req, res) => {
  try {
    const popularBooks = await getPopularBooksData();
    res.json(popularBooks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get active users
export const getActiveUsers = async (req, res) => {
  try {
    const activeUsers = await getActiveUsersData();
    res.json(activeUsers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get system overview statistics
export const getSystemOverview = async (req, res) => {
  try {
    const [
      bookStats,
      totalUsers,
      booksBorrowed,
      overdueLoans,
      loansToday,
      returnsToday
    ] = await Promise.all([
      getBookStats(),
      countUsers(),
      getLoanCountByStatus('ACTIVE'),
      getLoanCountByStatus('OVERDUE'),
      getLoansToday(),
      getReturnsToday()
    ]);

    const stats = {
      total_books: bookStats.total || 0,
      total_users: totalUsers,
      books_available: bookStats.available || 0,
      books_borrowed: booksBorrowed,
      overdue_loans: overdueLoans,
      loans_today: loansToday,
      returns_today: returnsToday
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 