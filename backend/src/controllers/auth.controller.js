const UserModel = require('../models/user.model');
const { generateToken } = require('../utils/jwt');
const { sendSuccess, sendError } = require('../utils/response');
const logger = require('../utils/logger');

/**
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existing = await UserModel.findByEmail(email);
    if (existing) {
      return sendError(res, 'An account with this email already exists.', 409);
    }

    const user = await UserModel.create({ name, email, password });
    const token = generateToken({ id: user.id, email: user.email, role: user.role });

    logger.info(`New user registered: ${email}`);
    return sendSuccess(res, { user, token }, 'Registration successful.', 201);
  } catch (err) {
    next(err);
  }
};

/**
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await UserModel.findByEmail(email);
    if (!user) {
      return sendError(res, 'Invalid email or password.', 401);
    }

    if (!user.is_active) {
      return sendError(res, 'Your account has been deactivated.', 403);
    }

    const isValid = await UserModel.verifyPassword(password, user.password_hash);
    if (!isValid) {
      return sendError(res, 'Invalid email or password.', 401);
    }

    const token = generateToken({ id: user.id, email: user.email, role: user.role });
    const { password_hash, ...safeUser } = user;

    logger.info(`User logged in: ${email}`);
    return sendSuccess(res, { user: safeUser, token }, 'Login successful.');
  } catch (err) {
    next(err);
  }
};

/**
 * @route   GET /api/v1/auth/me
 * @access  Private
 */
const getProfile = async (req, res, next) => {
  try {
    const user = await UserModel.findById(req.user.id);
    if (!user) return sendError(res, 'User not found.', 404);
    return sendSuccess(res, { user }, 'Profile fetched successfully.');
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, getProfile };
