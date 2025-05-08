import Loan from '../models/Loan.js';
import mongoose from 'mongoose';
import { findUserById } from './userController.js';
import { findBookById, decreaseBookAvailability, increaseBookAvailability } from './bookController.js';

// Create a new loan
export const createLoan = async (req, res) => {
  try {
    const { user_id, book_id, due_date } = req.body;

    const user = await findUserById(user_id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const book = await findBookById(book_id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    if (book.availableCopies <= 0) {
      return res.status(400).json({ message: 'Book is not available for loan' });
    }

    const loan = new Loan({
      user: user_id,
      book: book_id,
      dueDate: due_date
    });

    await decreaseBookAvailability(book_id);
    await loan.save();

    res.status(201).json(loan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const updateLoan = async (req, res) => {
  try {
    const { id } = req.params; // comes from /loans/:id
    const { dueDate } = req.body;
    
    const updateData = {};
    if (dueDate) {
      updateData.dueDate = new Date(Date.parse(dueDate)); // Ensures proper date parsing


      // Check if the new due date makes the loan overdue
      if (updateData.dueDate < new Date()) {
        updateData.status = 'OVERDUE';
      }
    }

    const updatedLoan = await Loan.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    );

    console.log("Updated Loan:", updatedLoan); // Log the updated loan

    if (!updatedLoan) {
      return res.status(404).json({ message: 'Loan not found' });
    }

    res.json(updatedLoan);
  } catch (err) {
    console.error("Error updating loan:", err); // Log the error
    res.status(500).json({ message: err.message });
  }
};





// Return a book
export const returnBook = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { loan_id } = req.body;
    const loan = await Loan.findById(loan_id);
    
    if (!loan) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Loan not found' });
    }

    loan.status = 'RETURNED';
    loan.returnDate = new Date();
    await loan.save({ session });

    await increaseBookAvailability(loan.book, session);

    await session.commitTransaction();
    res.json(loan);
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ message: error.message });
  } finally {
    session.endSession();
  }
};

// Get user's loan history
export const getUserLoans = async (req, res) => {
  try {
    const loans = await Loan.find({ user: req.params.userId })
      .populate('book', 'title author')
      .sort({ issueDate: -1 });

    res.json(loans);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get overdue loans
export const getOverdueLoans = async (req, res) => {
  try {
    const now = new Date();
    const overdueLoans = await Loan.find({
      dueDate: { $lt: now },
      status: { $in: ['ACTIVE', 'OVERDUE'] }
    })
    .populate('user', 'name email')
    .populate('book', 'title author')
    .sort({ dueDate: 1 });

    const formattedLoans = overdueLoans.map(loan => {
      const dueDate = new Date(loan.dueDate);
      const diffTime = Math.abs(now - dueDate);
      const daysOverdue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      return {
        id: loan._id,
        user: {
          id: loan.user._id,
          name: loan.user.name,
          email: loan.user.email
        },
        book: {
          id: loan.book._id,
          title: loan.book.title,
          author: loan.book.author
        },
        issue_date: loan.issueDate.toISOString(),
        due_date: loan.dueDate.toISOString(),
        days_overdue: daysOverdue
      };
    });

    res.json(formattedLoans);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Extend loan due date
export const extendLoan = async (req, res) => {
  try {
    const { extension_days } = req.body;
    
    if (!extension_days || isNaN(extension_days) || extension_days <= 0) {
      return res.status(400).json({ message: 'Invalid extension days' });
    }

    const loan = await Loan.findById(req.params.id);

    if (!loan) {
      return res.status(404).json({ message: 'Loan not found' });
    }

    if (!['ACTIVE', 'OVERDUE'].includes(loan.status)) {
      return res.status(400).json({ message: 'Can only extend active or overdue loans' });
    }

    if (loan.extensionsCount >= 2) {
      return res.status(400).json({ message: 'Maximum number of extensions reached' });
    }

    const originalDueDate = loan.dueDate;
    const newDueDate = new Date(originalDueDate);
    newDueDate.setDate(originalDueDate.getDate() + parseInt(extension_days));

    // Increment extensions count
    loan.extensionsCount += 1;
    loan.dueDate = newDueDate;
    loan.status = 'ACTIVE';
    await loan.save();

    res.json({
      id: loan._id,
      user_id: loan.user,
      book_id: loan.book,
      issue_date: loan.issueDate.toISOString(),
      original_due_date: originalDueDate.toISOString(),
      extended_due_date: loan.dueDate.toISOString(),
      status: loan.status,
      extensions_count: loan.extensionsCount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// For stats controller
export const getPopularBooksData = async () => {
  try {
    return await Loan.aggregate([
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
  } catch (error) {
    throw new Error(`Error getting popular books: ${error.message}`);
  }
};

// For stats controller
export const getActiveUsersData = async () => {
  try {
    return await Loan.aggregate([
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
  } catch (error) {
    throw new Error(`Error getting active users: ${error.message}`);
  }
};

// For stats controller
export const getLoanCountByStatus = async (status) => {
  try {
    return await Loan.countDocuments({ status });
  } catch (error) {
    throw new Error(`Error counting loans by status: ${error.message}`);
  }
};

// For stats controller
export const getLoansToday = async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return await Loan.countDocuments({
      issueDate: { $gte: today }
    });
  } catch (error) {
    throw new Error(`Error counting loans today: ${error.message}`);
  }
};

// For stats controller
export const getReturnsToday = async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return await Loan.countDocuments({
      returnDate: { $gte: today }
    });
  } catch (error) {
    throw new Error(`Error counting returns today: ${error.message}`);
  }
};