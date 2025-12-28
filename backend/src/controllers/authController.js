const User = require('../models/User');
const { hashPassword, comparePassword } = require('../utils/helpers');
const { generateToken } = require('../config/jwt');
const { successResponse, errorResponse } = require('../utils/response');

const register = async (req, res, next) => {
  try {
    const { name, email, password, phone, address } = req.body;

    // Check if email exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return errorResponse(res, 'Email already registered', 400);
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const userId = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      address,
      role: 'student'
    });

    // Generate token
    const token = generateToken({ id: userId, email, role: 'student' });

    successResponse(res, 'Registration successful', { token }, 201);
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findByEmail(email);
    if (!user) {
      return errorResponse(res, 'Invalid email or password', 401);
    }

    // Check password
    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return errorResponse(res, 'Invalid email or password', 401);
    }

    // Check if active
    if (!user.is_active) {
      return errorResponse(res, 'Account is deactivated', 403);
    }

    // Generate token
    const token = generateToken({ 
      id: user.id, 
      email: user.email, 
      role: user.role 
    });

    successResponse(res, 'Login successful', {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }
    successResponse(res, 'Profile retrieved successfully', user);
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, address } = req.body;
    await User.update(req.user.id, { name, phone, address });
    successResponse(res, 'Profile updated successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getProfile, updateProfile };
