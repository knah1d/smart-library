import Loan from "../models/Loan.js";
import mongoose from "mongoose";
import { getUserById } from "../services/UserApi.js";
import {
  getBookById,
  decreaseBookAvailability,
  increaseBookAvailability,
  updateBookAvailability,
} from "../services/BookApi.js";

// Create a new loan
export const createLoan = async (req, res) => {
  try {
    const { user_id, book_id, due_date } = req.body;

    const user = await getUserById(user_id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const book = await getBookById(book_id);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }
    if (book.availableCopies <= 0) {
      return res
        .status(400)
        .json({ message: "Book is not available for loan" });
    }

    const loan = new Loan({
      user: user_id,
      book: book_id,
      dueDate: due_date,
    });

    // Use the new updateBookAvailability method with 'decrement' operation
    await updateBookAvailability(book_id, null, "decrement");
    await loan.save();

    res.status(201).json(loan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get details of a specific loan.

export const getLoanById = async (req, res) => {
  try {
    const { id } = req.params; // comes from /loans/:id
    const loan = await Loan.findById(id);
    if (!loan) {
      return res.status(404).json({ message: "Loan not found" });
    }
    const book = await getBookById(loan.book);
    const user = await getUserById(loan.user);
    if (!book || !user) {
      return res.status(404).json({ message: "Book or User not found" });
    }
    res.json({
      id: loan._id,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
      book: {
        id: book._id,
        title: book.title,
        author: book.author,
      },
      issue_date: loan.issueDate.toISOString(),
      due_date: loan.dueDate.toISOString(),
      return_date: loan.returnDate ? loan.returnDate.toISOString() : null,
      status: loan.status,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update loan details
export const updateLoan = async (req, res) => {
  try {
    const { id } = req.params; // comes from /loans/:id
    const { dueDate } = req.body;

    const updateData = {};
    if (dueDate) {
      updateData.dueDate = new Date(Date.parse(dueDate)); // Ensures proper date parsing

      // Check if the new due date makes the loan overdue
      if (updateData.dueDate < new Date()) {
        updateData.status = "OVERDUE";
      }
    }

    const updatedLoan = await Loan.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    );

    console.log("Updated Loan:", updatedLoan); // Log the updated loan

    if (!updatedLoan) {
      return res.status(404).json({ message: "Loan not found" });
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
      return res.status(404).json({ message: "Loan not found" });
    }

    loan.status = "RETURNED";
    loan.returnDate = new Date();
    await loan.save({ session });

    // Use the new updateBookAvailability method with 'increment' operation
    await updateBookAvailability(loan.book, null, "increment");

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
    const loans = await Loan.find({ user: req.params.userId }).sort({
      issueDate: -1,
    });

    // Format loans to match the required response structure
    const formattedLoans = await Promise.all(
      loans.map(async (loan) => {
        // Fetch book details from book service
        let bookDetails = {
          id: loan.book,
          title: "Unknown",
          author: "Unknown",
        };
        try {
          const book = await getBookById(loan.book);
          if (book) {
            bookDetails = {
              id: book._id,
              title: book.title,
              author: book.author,
            };
          }
        } catch (error) {
          console.error(`Error fetching book details: ${error.message}`);
        }

        // Format the loan object to match the required structure
        return {
          id: loan._id,
          book: bookDetails,
          issue_date: loan.issueDate.toISOString(),
          due_date: loan.dueDate.toISOString(),
          return_date: loan.returnDate ? loan.returnDate.toISOString() : null,
          status: loan.status,
        };
      })
    );

    // Return the formatted response with total count
    res.json({
      loans: formattedLoans,
      total: formattedLoans.length,
    });
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
      status: { $in: ["ACTIVE", "OVERDUE"] },
    }).sort({ dueDate: 1 });

    // Manually fetch user and book details
    const formattedLoans = await Promise.all(
      overdueLoans.map(async (loan) => {
        const dueDate = new Date(loan.dueDate);
        const diffTime = Math.abs(now - dueDate);
        const daysOverdue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // Fetch user details
        let userName = "Unknown";
        let userEmail = "unknown@example.com";
        let userId = loan.user;

        try {
          const user = await getUserById(loan.user);
          if (user) {
            userName = user.name;
            userEmail = user.email;
            userId = user._id;
          }
        } catch (error) {
          console.error(`Error fetching user details: ${error.message}`);
        }

        // Fetch book details
        let bookTitle = "Unknown";
        let bookAuthor = "Unknown";
        let bookId = loan.book;

        try {
          const book = await getBookById(loan.book);
          if (book) {
            bookTitle = book.title;
            bookAuthor = book.author;
            bookId = book._id;
          }
        } catch (error) {
          console.error(`Error fetching book details: ${error.message}`);
        }

        return {
          id: loan._id,
          user: {
            id: userId,
            name: userName,
            email: userEmail,
          },
          book: {
            id: bookId,
            title: bookTitle,
            author: bookAuthor,
          },
          issue_date: loan.issueDate.toISOString(),
          due_date: loan.dueDate.toISOString(),
          days_overdue: daysOverdue,
        };
      })
    );

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
      return res.status(400).json({ message: "Invalid extension days" });
    }

    const loan = await Loan.findById(req.params.id);

    if (!loan) {
      return res.status(404).json({ message: "Loan not found" });
    }

    if (!["ACTIVE", "OVERDUE"].includes(loan.status)) {
      return res
        .status(400)
        .json({ message: "Can only extend active or overdue loans" });
    }

    if (loan.extensionsCount >= 2) {
      return res
        .status(400)
        .json({ message: "Maximum number of extensions reached" });
    }

    const originalDueDate = loan.dueDate;
    const newDueDate = new Date(originalDueDate);
    newDueDate.setDate(originalDueDate.getDate() + parseInt(extension_days));

    // Increment extensions count
    loan.extensionsCount += 1;
    loan.dueDate = newDueDate;
    loan.status = "ACTIVE";
    await loan.save();

    res.json({
      id: loan._id,
      user_id: loan.user,
      book_id: loan.book,
      issue_date: loan.issueDate.toISOString(),
      original_due_date: originalDueDate.toISOString(),
      extended_due_date: loan.dueDate.toISOString(),
      status: loan.status,
      extensions_count: loan.extensionsCount,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// For stats controller
export const getPopularBooksData = async () => {
  try {
    // Get the most borrowed books
    const popularBookIds = await Loan.aggregate([
      {
        $group: {
          _id: "$book",
          borrowCount: { $sum: 1 },
        },
      },
      {
        $sort: { borrowCount: -1 },
      },
      {
        $limit: 10,
      },
    ]);

    // Manually fetch book details from book service
    const popularBooks = await Promise.all(
      popularBookIds.map(async (item) => {
        try {
          const book = await getBookById(item._id);
          return {
            book_id: item._id,
            title: book ? book.title : "Unknown",
            author: book ? book.author : "Unknown",
            borrow_count: item.borrowCount,
          };
        } catch (error) {
          console.error(`Error fetching book details: ${error.message}`);
          return {
            book_id: item._id,
            title: "Unknown",
            author: "Unknown",
            borrow_count: item.borrowCount,
          };
        }
      })
    );

    return popularBooks;
  } catch (error) {
    throw new Error(`Error getting popular books: ${error.message}`);
  }
};

// For stats controller
export const getActiveUsersData = async () => {
  try {
    // Get the most active users
    const activeUserIds = await Loan.aggregate([
      {
        $group: {
          _id: "$user",
          booksBorrowed: { $sum: 1 },
          currentBorrows: {
            $sum: {
              $cond: [{ $eq: ["$status", "ACTIVE"] }, 1, 0],
            },
          },
        },
      },
      {
        $sort: { booksBorrowed: -1 },
      },
      {
        $limit: 10,
      },
    ]);

    // Manually fetch user details from user service
    const activeUsers = await Promise.all(
      activeUserIds.map(async (item) => {
        try {
          const user = await getUserById(item._id);
          return {
            user_id: item._id,
            name: user ? user.name : "Unknown",
            books_borrowed: item.booksBorrowed,
            current_borrows: item.currentBorrows,
          };
        } catch (error) {
          console.error(`Error fetching user details: ${error.message}`);
          return {
            user_id: item._id,
            name: "Unknown",
            books_borrowed: item.booksBorrowed,
            current_borrows: item.currentBorrows,
          };
        }
      })
    );

    return activeUsers;
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
      issueDate: { $gte: today },
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
      returnDate: { $gte: today },
    });
  } catch (error) {
    throw new Error(`Error counting returns today: ${error.message}`);
  }
};
