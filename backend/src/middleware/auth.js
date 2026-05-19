const { verifyToken } = require('../utils/jwt');
const { sendError } = require('../utils/response');
const { query } = require('../config/database');
const logger = require('../utils/logger');

/**
 * Authenticate request via Bearer JWT token
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 'Access denied. No token provided.', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    // Fetch fresh user data from DB (ensures deactivated users are rejected)
    const result = await query(
      'SELECT id, name, email, role, is_active FROM users WHERE id = $1',
      [decoded.id]
    );

    if (result.rows.length === 0) {
      return sendError(res, 'User not found.', 401);
    }

    const user = result.rows[0];
    if (!user.is_active) {
      return sendError(res, 'Account is deactivated.', 403);
    }

    req.user = user;
    next();
  } catch (err) {
    logger.warn('Authentication failed:', err.message);
    if (err.name === 'TokenExpiredError') {
      return sendError(res, 'Token has expired. Please login again.', 401);
    }
    if (err.name === 'JsonWebTokenError') {
      return sendError(res, 'Invalid token.', 401);
    }
    return sendError(res, 'Authentication failed.', 401);
  }
};

/**
 * Role-based access control — pass allowed roles as args
 * Usage: authorize('admin') or authorize('admin', 'user')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 'Unauthorized.', 401);
    }
    if (!roles.includes(req.user.role)) {
      return sendError(res, `Access denied. Requires one of: ${roles.join(', ')}`, 403);
    }
    next();
  };
};

module.exports = { authenticate, authorize };
