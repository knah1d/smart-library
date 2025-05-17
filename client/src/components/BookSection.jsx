import { useState, useEffect } from "react";
import { bookAPI } from "../services/book-api.js";

const BookSection = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    perPage: 10,
    total: 0,
  });
  const [newBook, setNewBook] = useState({
    title: "",
    author: "",
    isbn: "",
    copies: 1,
  });

  useEffect(() => {
    fetchBooks();
  }, [pagination.page, pagination.perPage]);

  const fetchBooks = async (search = searchTerm) => {
    setLoading(true);
    setError("");
    try {
      const data = await bookAPI.getBooks(
        search,
        pagination.page,
        pagination.perPage
      );
      // Check if the response is in the new format or old format
      if (data.books) {
        setBooks(data.books);
        setPagination({
          ...pagination,
          total: data.total || 0,
        });
      } else {
        setBooks(data);
      }
    } catch (err) {
      setError("Failed to fetch books");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewBook((prev) => ({
      ...prev,
      [name]: name === "copies" ? Number(value) : value,
    }));
  };

  const handleAddBook = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await bookAPI.createBook(newBook);
      setNewBook({ title: "", author: "", isbn: "", copies: 1 });
      // Refresh the book list and reset to first page
      setPagination({ ...pagination, page: 1 });
      fetchBooks();
    } catch (err) {
      setError("Failed to add book");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Books</h2>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search books by title or author..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-grow px-4 py-2 border rounded-md"
          />
          <button
            onClick={() => fetchBooks(searchTerm)}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Search
          </button>
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm("");
                fetchBooks("");
              }}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Add New Book</h3>
        <form onSubmit={handleAddBook} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Title
            </label>
            <input
              type="text"
              name="title"
              value={newBook.title}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm h-10"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Author
            </label>
            <input
              type="text"
              name="author"
              value={newBook.author}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm h-10"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              ISBN
            </label>
            <input
              type="text"
              name="isbn"
              value={newBook.isbn}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm h-10"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Copies
            </label>
            <input
              type="number"
              name="copies"
              value={newBook.copies}
              onChange={handleInputChange}
              min="1"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm h-10"
              required
            />
          </div>

          <button
            type="submit"
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            disabled={loading}
          >
            {loading ? "Adding..." : "Add Book"}
          </button>
        </form>
      </div>

      <div className="mt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Book List</h3>
          <button
            onClick={fetchBooks}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded text-sm"
            disabled={loading}
          >
            {loading ? "Loading..." : "Refresh Books"}
          </button>
        </div>

        {error && <p className="text-red-500 mb-2">{error}</p>}

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Book ID
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Author
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ISBN
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Copies
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Updated
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {books.length > 0 ? (
                books.map((book) => (
                  <tr key={book._id || book.id}>
                    <td className="px-3 py-2 whitespace-nowrap text-sm">
                      {book._id || book.id}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm">
                      {book.title}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm">
                      {book.author}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm">
                      {book.isbn}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm">
                      {book.copies || 0} (
                      {book.availableCopies || book.available_copies || 0}{" "}
                      available)
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm">
                      {book.created_at
                        ? new Date(book.created_at).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm">
                      {book.updated_at
                        ? new Date(book.updated_at).toLocaleDateString()
                        : "N/A"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-3 py-2 text-center text-sm">
                    {loading
                      ? "Loading books..."
                      : "No books found. Click Refresh to load books."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {pagination.total > 0 && (
          <div className="mt-4 flex justify-between items-center">
            <div>
              <span className="text-sm text-gray-700">
                Showing page {pagination.page} of{" "}
                {Math.ceil(pagination.total / pagination.perPage)}(
                {pagination.total} total books)
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() =>
                  setPagination({
                    ...pagination,
                    page: Math.max(1, pagination.page - 1),
                  })
                }
                disabled={pagination.page <= 1}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() =>
                  setPagination({ ...pagination, page: pagination.page + 1 })
                }
                disabled={
                  pagination.page >=
                  Math.ceil(pagination.total / pagination.perPage)
                }
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookSection;
