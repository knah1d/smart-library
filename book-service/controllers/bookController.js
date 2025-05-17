import Book from "../models/Book.js";

// Create a new book
export const createBook = async (req, res) => {
  try {
    const { title, author, isbn, copies } = req.body;

    const existingBook = await Book.findOne({ isbn });
    if (existingBook) {
      return res
        .status(400)
        .json({ message: "Book with this ISBN already exists" });
    }

    const book = new Book({
      title,
      author,
      isbn,
      copies,
      availableCopies: copies,
    });
    await book.save();

    // Format response to be consistent with other endpoints
    const formattedBook = {
      id: book._id,
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      copies: book.copies,
      available_copies: book.availableCopies,
      created_at: book.createdAt.toISOString(),
      updated_at: book.updatedAt.toISOString(),
    };

    res.status(201).json(formattedBook);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all books with search functionality
export const getBooks = async (req, res) => {
  try {
    const { search, page = 1, per_page = 10 } = req.query;
    let query = {};

    if (search) {
      query = {
        $or: [
          { title: { $regex: search, $options: "i" } },
          { author: { $regex: search, $options: "i" } },
        ],
      };
    }

    // Calculate pagination
    const pageNum = parseInt(page);
    const limit = parseInt(per_page);
    const skip = (pageNum - 1) * limit;

    // Get total count
    const total = await Book.countDocuments(query);

    // Get paginated results
    const books = await Book.find(query).skip(skip).limit(limit);

    // Format the response
    const formattedBooks = books.map((book) => ({
      id: book._id,
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      copies: book.copies,
      available_copies: book.availableCopies,
      created_at: book.createdAt.toISOString(),
      updated_at: book.updatedAt.toISOString(),
    }));

    res.json({
      books: formattedBooks,
      total,
      page: pageNum,
      per_page: limit,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get book by ID
export const getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    // Format response to match the structure used in getBooks
    const formattedBook = {
      id: book._id,
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      copies: book.copies,
      available_copies: book.availableCopies,
      created_at: book.createdAt.toISOString(),
      updated_at: book.updatedAt.toISOString(),
    };

    res.json(formattedBook);
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
      return res.status(404).json({ message: "Book not found" });
    }

    if (isbn && isbn !== book.isbn) {
      const existingBook = await Book.findOne({ isbn });
      if (existingBook) {
        return res.status(400).json({ message: "ISBN already in use" });
      }
    }

    if (title) book.title = title;
    if (author) book.author = author;
    if (isbn) book.isbn = isbn;
    if (copies !== undefined) book.copies = copies;
    if (available_copies !== undefined) {
      if (available_copies > book.copies) {
        return res
          .status(400)
          .json({ message: "Available copies cannot exceed total copies" });
      }
      book.availableCopies = available_copies;
    }

    await book.save();

    // Format response to be consistent with other endpoints
    const formattedBook = {
      id: book._id,
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      copies: book.copies,
      available_copies: book.availableCopies,
      created_at: book.createdAt.toISOString(),
      updated_at: book.updatedAt.toISOString(),
    };

    res.json(formattedBook);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete book
export const deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    if (book.copies !== book.availableCopies) {
      return res
        .status(400)
        .json({ message: "Cannot delete book with active loans" });
    }

    await book.deleteOne();
    res.status(201).json({ message: "Book deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// decrease book availability - for loan controller
export const decreaseBookAvailability = async (bookId, session = null) => {
  try {
    const book = await Book.findById(bookId);
    if (!book) {
      throw new Error("Book not found");
    }
    if (book.availableCopies <= 0) {
      throw new Error("Book is not available for loan");
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
      throw new Error("Book not found");
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

// API Endpoint handlers for availability
export const decreaseAvailabilityEndpoint = async (req, res) => {
  try {
    const bookId = req.params.id;
    const book = await decreaseBookAvailability(bookId);

    // Format response to be consistent with other endpoints
    const formattedBook = {
      id: book._id,
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      copies: book.copies,
      available_copies: book.availableCopies,
      created_at: book.createdAt.toISOString(),
      updated_at: book.updatedAt.toISOString(),
    };

    res.json(formattedBook);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const increaseAvailabilityEndpoint = async (req, res) => {
  try {
    const bookId = req.params.id;
    const book = await increaseBookAvailability(bookId);

    // Format response to be consistent with other endpoints
    const formattedBook = {
      id: book._id,
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      copies: book.copies,
      available_copies: book.availableCopies,
      created_at: book.createdAt.toISOString(),
      updated_at: book.updatedAt.toISOString(),
    };

    res.json(formattedBook);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get popular books
export const getPopularBooks = async (req, res) => {
  try {
    const popularBooks = await getPopularBooksData();
    res.json(popularBooks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get book stats - for stats controller
export const getBookStats = async () => {
  try {
    const stats = await Book.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: "$copies" },
          available: { $sum: "$availableCopies" },
        },
      },
    ]);
    return stats[0] || { total: 0, available: 0 };
  } catch (error) {
    throw new Error(`Error getting book stats: ${error.message}`);
  }
};

// Update book availability
export const updateBookAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const { operation } = req.body;

    const book = await Book.findById(id);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }
    // Direct update to specific value
   
    
    // Update availability based on operation
    if (operation === "increment") {
       if (book.availableCopies >= book.copies) {
      return res.status(400).json({
        message: "Available copies cannot exceed total copies",
      });
    }
      book.availableCopies += 1;
    } else if (operation === "decrement") {
      if (book.availableCopies <= 0) {
        return res
          .status(400)
          .json({ message: "No available copies to decrease" });
      }
      book.availableCopies -= 1;
    } else {
      return res.status(400).json({
        message: "Either operation or available_copies must be provided",
      });
    }

    await book.save();

    // Return simplified response as specified
    res.json({
      id: book._id,
      available_copies: book.availableCopies,
      updated_at: book.updatedAt.toISOString(),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
