import Book from '../models/Book.js';

// Create a new book
export const createBook = async (req, res) => {
  try {
    const { title, author, isbn, copies } = req.body;
    
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
    const { title, author, isbn, copies, available_copies } = req.body;
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    if (isbn && isbn !== book.isbn) {
      const existingBook = await Book.findOne({ isbn });
      if (existingBook) {
        return res.status(400).json({ message: 'ISBN already in use' });
      }
    }

    if (title) book.title = title;
    if (author) book.author = author;
    if (isbn) book.isbn = isbn;
    if (copies !== undefined) book.copies = copies;
    if (available_copies !== undefined) {
      if (available_copies > book.copies) {
        return res.status(400).json({ message: 'Available copies cannot exceed total copies' });
      }
      book.availableCopies = available_copies;
    }

    await book.save();
    res.json(book);
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

    if (book.copies !== book.availableCopies) {
      return res.status(400).json({ message: 'Cannot delete book with active loans' });
    }

    await book.deleteOne();
    res.status(201).json({ message: 'Book deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Find book by ID - for loan controller to use
export const findBookById = async (bookId) => {
  try {
    return await Book.findById(bookId);
  } catch (error) {
    throw new Error(`Error finding book: ${error.message}`);
  }
};

// Update book availability - for loan controller
export const decreaseBookAvailability = async (bookId, session = null) => {
  try {
    const book = await Book.findById(bookId);
    if (!book) {
      throw new Error('Book not found');
    }
    if (book.availableCopies <= 0) {
      throw new Error('Book is not available for loan');
    }
    book.availableCopies -= 1;
    if (session) {
      await book.save({ session });
    } else {
      await book.save();
    }
    return book;
  } catch (error) {
    throw new Error(`Error updating book availability: ${error.message}`);
  }
};

// Increase book availability when returned - for loan controller
export const increaseBookAvailability = async (bookId, session = null) => {
  try {
    const book = await Book.findById(bookId);
    if (!book) {
      throw new Error('Book not found');
    }
    book.availableCopies += 1;
    if (session) {
      await book.save({ session });
    } else {
      await book.save();
    }
    return book;
  } catch (error) {
    throw new Error(`Error updating book availability: ${error.message}`);
  }
};

// Get book stats - for stats controller
export const getBookStats = async () => {
  try {
    const stats = await Book.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: '$copies' },
          available: { $sum: '$availableCopies' }
        }
      }
    ]);
    return stats[0] || { total: 0, available: 0 };
  } catch (error) {
    throw new Error(`Error getting book stats: ${error.message}`);
  }
};