import Book from '../models/Book.js';
import User from '../models/User.js';
import Loan from '../models/Loan.js';

// Get popular books
export const getPopularBooks = async (req, res) => {
  try {
    const popularBooks = await Loan.aggregate([
      {
        $group: {
          _id: '$book',
          borrowCount: { $sum: 1 }
        }
      },
      {
        $sort: { borrowCount: -1 }
      },
      {
        $limit: 10
      },
      {
        $lookup: {
          from: 'books',
          localField: '_id',
          foreignField: '_id',
          as: 'bookDetails'
        }
      },
      {
        $unwind: '$bookDetails'
      },
      {
        $project: {
          book_id: '$_id',
          title: '$bookDetails.title',
          author: '$bookDetails.author',
          borrow_count: '$borrowCount'
        }
      }
    ]);

    res.json(popularBooks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get active users
export const getActiveUsers = async (req, res) => {
  try {
    const activeUsers = await Loan.aggregate([
      {
        $group: {
          _id: '$user',
          booksBorrowed: { $sum: 1 },
          currentBorrows: {
            $sum: {
              $cond: [{ $eq: ['$status', 'ACTIVE'] }, 1, 0]
            }
          }
        }
      },
      {
        $sort: { booksBorrowed: -1 }
      },
      {
        $limit: 10
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userDetails'
        }
      },
      {
        $unwind: '$userDetails'
      },
      {
        $project: {
          user_id: '$_id',
          name: '$userDetails.name',
          books_borrowed: '$booksBorrowed',
          current_borrows: '$currentBorrows'
        }
      }
    ]);

    res.json(activeUsers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get system overview statistics
export const getSystemOverview = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalBooks,
      totalUsers,
      booksBorrowed,
      overdueLoans,
      loansToday,
      returnsToday
    ] = await Promise.all([
      Book.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: '$copies' },
            available: { $sum: '$availableCopies' }
          }
        }
      ]),
      User.countDocuments(),
      Loan.countDocuments({ status: 'ACTIVE' }),
      Loan.countDocuments({ status: 'OVERDUE' }),
      Loan.countDocuments({
        issueDate: { $gte: today }
      }),
      Loan.countDocuments({
        returnDate: { $gte: today }
      })
    ]);

    const stats = {
      total_books: totalBooks[0]?.total || 0,
      total_users: totalUsers,
      books_available: totalBooks[0]?.available || 0,
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