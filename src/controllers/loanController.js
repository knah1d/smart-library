import { validationResult } from 'express-validator';
import Loan from '../models/Loan.js';
import Book from '../models/Book.js';
import User from '../models/User.js';
import mongoose from 'mongoose';

// Create a new loan
export const createLoan = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { user_id, book_id, due_date } = req.body;

    // Check if user exists
    const user = await User.findById(user_id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if book exists and is available
    const book = await Book.findById(book_id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    if (book.availableCopies <= 0) {
      return res.status(400).json({ message: 'Book is not available for loan' });
    }

    // Check if user has any overdue books
    const overdueLoans = await Loan.find({
      user: user_id,
      status: 'OVERDUE'
    });
    if (overdueLoans.length > 0) {
      return res.status(400).json({ message: 'User has overdue books' });
    }

    // Create loan
    const loan = new Loan({
      user: user_id,
      book: book_id,
      dueDate: due_date,
      originalDueDate: due_date
    });

    // Update book availability
    book.availableCopies -= 1;
    await book.save();
    await loan.save();

    res.status(201).json(loan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Return a book
export const returnBook = async (req, res) => {
  // Start a session for the transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { loan_id } = req.body;

    // First verify the loan exists
    const existingLoan = await Loan.findById(loan_id);
    if (!existingLoan) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Loan not found' });
    }

    // Then try to update it atomically
    const loan = await Loan.findOneAndUpdate(
      { 
        _id: loan_id,
        status: { $ne: 'RETURNED' } // Ensure we don't update already returned loans
      },
      { 
        $set: {
          status: 'RETURNED',
          returnDate: new Date()
        }
      },
      { 
        new: true, // Return updated document
        session,
        runValidators: true
      }
    ).populate('book', 'title author');

    if (!loan) {
      await session.abortTransaction();
      return res.status(400).json({ message: 'Book already returned or loan not found' });
    }

    // Update book availability atomically
    const book = await Book.findOneAndUpdate(
      { _id: loan.book._id },
      { $inc: { availableCopies: 1 } },
      { new: true, session }
    );

    if (!book) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Associated book not found' });
    }

    // Commit the transaction
    await session.commitTransaction();

    // Format the response
    res.json({
      id: loan._id,
      book: {
        id: loan.book._id,
        title: loan.book.title,
        author: loan.book.author
      },
      issue_date: loan.issueDate,
      due_date: loan.dueDate,
      return_date: loan.returnDate,
      status: loan.status
    });

  } catch (error) {
    await session.abortTransaction();
    console.error('Error returning book:', error);
    res.status(500).json({ 
      message: 'Error returning book', 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
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

    const formattedLoans = loans.map(loan => ({
      id: loan._id,
      book: {
        id: loan.book._id,
        title: loan.book.title,
        author: loan.book.author
      },
      issue_date: loan.issueDate,
      due_date: loan.dueDate,
      return_date: loan.returnDate || null,
      status: loan.status
    }));

    res.json(formattedLoans);
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
      status: { $in: ['ACTIVE', 'OVERDUE'] }  // Include both ACTIVE and OVERDUE loans
    })
    .populate('user', 'name email')
    .populate('book', 'title author')
    .sort({ dueDate: 1 });  // Sort by due date ascending

    const formattedLoans = overdueLoans.map(loan => {
      // Calculate days overdue
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
    console.error('Error fetching overdue loans:', error);
    res.status(500).json({ 
      message: 'Error fetching overdue loans',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
};

// Extend loan due date
export const extendLoan = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { extension_days } = req.body;
    const loanId = req.params.id;

    if (!extension_days || extension_days <= 0) {
      return res.status(400).json({ message: 'Valid extension days are required' });
    }

    const loan = await Loan.findById(loanId).populate('user', 'name email').populate('book', 'title author');
    if (!loan) {
      return res.status(404).json({ message: 'Loan not found' });
    }

    // Allow both ACTIVE and OVERDUE loans to be extended
    if (!['ACTIVE', 'OVERDUE'].includes(loan.status)) {
      return res.status(400).json({ 
        message: 'Can only extend active or overdue loans',
        current_status: loan.status,
        loan_details: {
          id: loan._id,
          user: loan.user,
          book: loan.book,
          issue_date: loan.issueDate,
          due_date: loan.dueDate,
          status: loan.status
        }
      });
    }

    if (loan.extensionsCount >= 2) {
      return res.status(400).json({ 
        message: 'Maximum number of extensions reached',
        extensions_count: loan.extensionsCount
      });
    }

    // Calculate new due date
    const newDueDate = new Date(loan.dueDate);
    newDueDate.setDate(newDueDate.getDate() + extension_days);

    loan.dueDate = newDueDate;
    loan.extensionsCount = (loan.extensionsCount || 0) + 1;
    loan.status = 'ACTIVE'; // Reset status to ACTIVE after extension
    await loan.save();

    // Format the response
    res.json({
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
      issue_date: loan.issueDate,
      due_date: loan.dueDate,
      extensions_count: loan.extensionsCount,
      status: loan.status,
      message: 'Loan extended successfully'
    });
  } catch (error) {
    console.error('Error extending loan:', error);
    res.status(500).json({ 
      message: 'Error extending loan',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
};