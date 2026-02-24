import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const signUp = async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = new User({ email, password, name });
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: 'User created successfully',
      user: { id: user._id, name: user.name, email: user.email },
      token,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const logIn = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      user: { id: user._id, name: user.name, email: user.email },
      token,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getCurrentUser = async (req, res) => {
  try {
    res.json({
      user: { id: req.user._id, name: req.user.name, email: req.user.email },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const logOut = async (req, res) => {
  try {
    // For JWT, logout is handled on client side by removing token
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { signUp, logIn, getCurrentUser, logOut };