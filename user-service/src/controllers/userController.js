import User from '../models/User.js';

// Create a new user
export const createUser = async (req, res) => {
  try {
    const { name, email, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
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
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update user
export const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { email } = req.body;
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) return res.status(400).json({ message: 'Email already in use' });
    }

    const { role } = req.body;
    if (role !== undefined) {
      const validRoles = ['student', 'faculty'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({ message: 'Invalid role' });
      }
      // Only check for role restrictions if the role is being changed
     
        if (role === 'faculty' && user.role == 'faculty') {
          return res.status(403).json({ message: 'Already assigned as a faculty' });
        }
        if (role === 'student' && user.role == 'student') {
          return res.status(403).json({ message: 'Already assigned as a student' });
        }
      
    }

    const updates = {};
    if (req.body.name !== undefined) updates.name = req.body.name;
    if (req.body.email !== undefined) updates.email = req.body.email;
    if (role !== undefined) updates.role = role;


    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    );
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Find user by ID - for other controllers to use
export const findUserById = async (userId) => {
  try {
    return await User.findById(userId);
  } catch (error) {
    throw new Error(`Error finding user: ${error.message}`);
  }
};

// Count total users - for stats controller
export const countUsers = async () => {
  try {
    return await User.countDocuments();
  } catch (error) {
    throw new Error(`Error counting users: ${error.message}`);
  }
};