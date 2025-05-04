import { validationResult } from 'express-validator';
import Book from '../models/Book.js';

// Create a new book
export const createBook = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, author, isbn, copies } = req.body;
    
    // Check if book with ISBN already exists
    const existingBook = await Book.findOne({ isbn });
    if (existingBook) {
      return res.status(400).json({ message: 'Book with this ISBN already exists' });
    }

    const book = new Book({
      title,
      author,
      isbn,
      copies,
      availableCopies: copies,
    });
    await book.save();

    res.status(201).json(book);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all books with search functionality
export const getBooks = async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};

    if (search) {
      query = {
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { author: { $regex: search, $options: 'i' } },
        ]
      };
    }

    const books = await Book.find(query);
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get book by ID
export const getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    res.json(book);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update book
export const updateBook = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, author, isbn, copies, available_copies } = req.body;
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Check if ISBN is being changed and if it's already taken
    if (isbn && isbn !== book.isbn) {
      const existingBook = await Book.findOne({ isbn });
      if (existingBook) {
        return res.status(400).json({ message: 'ISBN already in use' });
      }
    }

    // Update only the fields that are provided
    if (title) book.title = title;
    if (author) book.author = author;
    if (isbn) book.isbn = isbn;
    
    // Handle copies and available_copies updates
    if (copies !== undefined) {
      book.copies = copies;
      // If available_copies not provided, maintain the same ratio of available to total copies
      if (available_copies === undefined) {
        book.availableCopies = Math.min(copies, book.availableCopies);
      }
    }
    
    if (available_copies !== undefined) {
      if (available_copies > book.copies) {
        return res.status(400).json({ message: 'Available copies cannot exceed total copies' });
      }
      book.availableCopies = available_copies;
    }

    await book.save();

    res.json({
      id: book._id,
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      copies: book.copies,
      available_copies: book.availableCopies,
      created_at: book.createdAt,
      updated_at: book.updatedAt
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete book
export const deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Check if book has any active loans
    if (book.copies !== book.availableCopies) {
      return res.status(400).json({ message: 'Cannot delete book with active loans' });
    }

    await book.deleteOne();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};