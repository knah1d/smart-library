import { useState } from "react";
import { userAPI } from "../services/user-api.js";

const UserSection = () => {
  const [userId, setUserId] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchType, setSearchType] = useState("id"); // "id" or "email"
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "student",
  });

  const fetchUser = async () => {
    if (searchType === "id") {
      if (!userId.trim()) {
        setError("Please enter a user ID");
        return;
      }

      setLoading(true);
      setError("");
      try {
        const data = await userAPI.getUser(userId);
        setUserData(data);
      } catch (err) {
        setError("Failed to fetch user");
        console.error(err);
      } finally {
        setLoading(false);
      }
    } else {
      // search by email
      if (!userEmail.trim()) {
        setError("Please enter a user email");
        return;
      }

      setLoading(true);
      setError("");
      try {
        const data = await userAPI.getUserByEmail(userEmail);
        setUserData(data);
      } catch (err) {
        setError("Failed to fetch user by email");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const result = await userAPI.createUser(newUser);
      setNewUser({ name: "", email: "", role: "student" });
      setUserId(result._id || result.id);
      fetchUser();
    } catch (err) {
      setError("Failed to create user");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Users</h2>

      {/* Create User Section */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Create New User</h3>
        <form onSubmit={handleCreateUser} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              name="name"
              value={newUser.name}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm h-10"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={newUser.email}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm h-10"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Role
            </label>
            <select
              name="role"
              value={newUser.role}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm h-10"
              required
            >
              <option value="student">Student</option>
              <option value="faculty">Faculty</option>
            </select>
          </div>
          <div>
            <button
              type="submit"
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              disabled={loading}
            >
              {loading ? "Creating..." : "Create User"}
            </button>
          </div>
        </form>
      </div>

      {/* Fetch User Section */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2">Fetch User</h3>

        <div className="mb-4">
          <div className="flex space-x-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                value="id"
                checked={searchType === "id"}
                onChange={() => setSearchType("id")}
                className="form-radio h-4 w-4 text-indigo-600"
              />
              <span className="ml-2">Search by ID</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                value="email"
                checked={searchType === "email"}
                onChange={() => setSearchType("email")}
                className="form-radio h-4 w-4 text-indigo-600"
              />
              <span className="ml-2">Search by Email</span>
            </label>
          </div>
        </div>

        {searchType === "id" ? (
          <div className="flex space-x-2">
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="flex-grow rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm h-10"
              placeholder="Enter User ID"
            />
            <button
              onClick={fetchUser}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded"
              disabled={loading}
            >
              {loading ? "Loading..." : "Fetch User"}
            </button>
          </div>
        ) : (
          <div className="flex space-x-2">
            <input
              type="email"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              className="flex-grow rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm h-10"
              placeholder="Enter User Email"
            />
            <button
              onClick={fetchUser}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded"
              disabled={loading}
            >
              {loading ? "Loading..." : "Fetch User"}
            </button>
          </div>
        )}

        {error && <p className="text-red-500 mt-2">{error}</p>}

        {userData && (
          <div className="mt-4 p-3 border rounded-md">
            <h4 className="font-medium">User Details:</h4>
            <p>
              <strong>ID:</strong> {userData._id || userData.id}
            </p>
            <p>
              <strong>Name:</strong> {userData.name}
            </p>
            <p>
              <strong>Email:</strong> {userData.email}
            </p>
            <p>
              <strong>Role:</strong> {userData.role}
            </p>
            {userData.created_at && (
              <p>
                <strong>Created:</strong>{" "}
                {new Date(userData.created_at).toLocaleString()}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserSection;
