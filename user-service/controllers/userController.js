import User from "../models/User.js";

// Create a new user
export const createUser = async (req, res) => {
  try {
    const { name, email, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User with this email already exists" });
    }

    const user = new User({ name, email, role });
    await user.save();

    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user by ID
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get User by email
export const getUserByEmail = async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res
        .status(400)
        .json({ message: "Email query parameter is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update user
export const updateUser = async (req, res) => {
  try {
    const { name, email, role } = req.body;
    const validRoles = ["student", "faculty"];

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Check if email is being changed and if it's already in use
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "Email already in use" });
      }
    }

    // Role validation
    if (role) {
      if (!validRoles.includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }
      if (role === user.role) {
        return res
          .status(403)
          .json({ message: `Already assigned as a ${role}` });
      }
    }

    // Build update object only with fields that are explicitly provided in the request
    // Don't include undefined values or empty strings that would overwrite existing data
    const updates = {};
    if (name !== undefined && name !== "") updates.name = name;
    if (email !== undefined && email !== "") updates.email = email;
    if (role !== undefined && role !== "") updates.role = role;

    // Only update if we have something to update
    if (Object.keys(updates).length > 0) {
      const updatedUser = await User.findByIdAndUpdate(req.params.id, updates, {
        new: true,
        runValidators: true,
      });
      res.json(updatedUser);
    } else {
      // If no updates were provided, just return the current user
      res.json(user);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Count total users - for stats controller
export const countUsers = async (req, res) => {
  try {
    return await User.countDocuments();
  } catch (error) {
    throw new Error(`Error counting users: ${error.message}`);
  }
};

// Get active users
export const getActiveUsers = async (req, res) => {
  try {
    const activeUsers = await getActiveUsersData();
    res.json(activeUsers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
