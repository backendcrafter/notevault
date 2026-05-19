const UserModel = require('../models/user.model');
const { sendSuccess, sendError, sendPaginated } = require('../utils/response');

/**
 * @route   GET /api/v1/admin/users
 * @access  Admin only
 */
const getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const { users, total } = await UserModel.findAll({ page, limit });
    return sendPaginated(res, users, total, page, limit);
  } catch (err) {
    next(err);
  }
};

/**
 * @route   PATCH /api/v1/admin/users/:id/status
 * @access  Admin only
 */
const updateUserStatus = async (req, res, next) => {
  try {
    const { is_active } = req.body;
    if (typeof is_active !== 'boolean') {
      return sendError(res, 'is_active must be a boolean.', 400);
    }

    if (req.params.id === req.user.id) {
      return sendError(res, 'You cannot change your own status.', 400);
    }

    const user = await UserModel.updateStatus(req.params.id, is_active);
    if (!user) return sendError(res, 'User not found.', 404);

    return sendSuccess(res, { user }, `User ${is_active ? 'activated' : 'deactivated'} successfully.`);
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllUsers, updateUserStatus };
