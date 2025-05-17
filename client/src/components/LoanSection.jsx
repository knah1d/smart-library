import { useState } from "react";
import { loanAPI } from "../services/loan-api.js";

const LoanSection = () => {
  const [userId, setUserId] = useState("");
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [newLoan, setNewLoan] = useState({
    user_id: "",
    book_id: "",
    due_date: "",
  });

  const fetchUserLoans = async () => {
    if (!userId.trim()) {
      setError("Please enter a user ID");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const data = await loanAPI.getUserLoans(userId);
      setLoans(data);
    } catch (err) {
      setError("Failed to fetch loans");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewLoan((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateLoan = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await loanAPI.createLoan(newLoan);
      setNewLoan({ user_id: "", book_id: "", due_date: "" });
      if (newLoan.user_id === userId) {
        fetchUserLoans(); // Refresh loans if the same user
      }
    } catch (err) {
      setError("Failed to create loan");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReturnBook = async (loanId) => {
    setLoading(true);
    setError("");
    try {
      await loanAPI.returnBook(loanId);
      fetchUserLoans(); // Refresh the loan list
    } catch (err) {
      setError("Failed to return book");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Loans</h2>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Create New Loan</h3>
        <form onSubmit={handleCreateLoan} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              User ID
            </label>
            <input
              type="text"
              name="user_id"
              value={newLoan.user_id}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm h-10"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Book ID
            </label>
            <input
              type="text"
              name="book_id"
              value={newLoan.book_id}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm h-10"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Due Date
            </label>
            <input
              type="date"
              name="due_date"
              value={newLoan.due_date}
              onChange={handleInputChange}
              min={getTomorrowDate()}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm h-10"
              required
            />
          </div>

          <button
            type="submit"
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Loan"}
          </button>
        </form>
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2">Fetch User Loans</h3>
        <div className="flex space-x-2">
          <input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="flex-grow rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm h-10"
            placeholder="Enter User ID"
          />
          <button
            onClick={fetchUserLoans}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded"
            disabled={loading}
          >
            {loading ? "Loading..." : "Fetch Loans"}
          </button>
        </div>

        {error && <p className="text-red-500 mt-2">{error}</p>}

        <div className="mt-4">
          <h4 className="font-medium mb-2">User Loans:</h4>
          {loans.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Book ID
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Due Date
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loans.map((loan) => (
                    <tr key={loan._id || loan.id}>
                      <td className="px-3 py-2 whitespace-nowrap text-sm">
                        {loan.book_id}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm">
                        {new Date(loan.due_date).toLocaleDateString()}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm">
                        {loan.returned ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Returned
                          </span>
                        ) : (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            Active
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm">
                        {!loan.returned && (
                          <button
                            onClick={() =>
                              handleReturnBook(loan._id || loan.id)
                            }
                            className="text-indigo-600 hover:text-indigo-900"
                            disabled={loading}
                          >
                            Return Book
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 italic">
              No loans found for this user.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoanSection;
