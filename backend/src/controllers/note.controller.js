const NoteModel = require('../models/note.model');
const { sendSuccess, sendError, sendPaginated } = require('../utils/response');
const logger = require('../utils/logger');

/**
 * @route   POST /api/v1/notes
 * @access  Private (user, admin)
 */
const createNote = async (req, res, next) => {
  try {
    const { title, content, is_pinned, tags } = req.body;
    const note = await NoteModel.create({
      user_id: req.user.id,
      title,
      content,
      is_pinned,
      tags,
    });
    logger.info(`Note created: ${note.id} by user ${req.user.id}`);
    return sendSuccess(res, { note }, 'Note created successfully.', 201);
  } catch (err) {
    next(err);
  }
};

/**
 * @route   GET /api/v1/notes
 * @access  Private (user sees own, admin sees all)
 */
const getNotes = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;

    let result;
    if (req.user.role === 'admin') {
      result = await NoteModel.findAll({ page, limit, search });
    } else {
      result = await NoteModel.findAllByUser({ user_id: req.user.id, page, limit, search });
    }

    return sendPaginated(res, result.notes, result.total, page, limit);
  } catch (err) {
    next(err);
  }
};

/**
 * @route   GET /api/v1/notes/:id
 * @access  Private
 */
const getNoteById = async (req, res, next) => {
  try {
    const note = await NoteModel.findById(req.params.id);
    if (!note) return sendError(res, 'Note not found.', 404);

    // Users can only view their own notes; admins can view any
    if (req.user.role !== 'admin' && note.user_id !== req.user.id) {
      return sendError(res, 'You do not have permission to view this note.', 403);
    }

    return sendSuccess(res, { note }, 'Note fetched successfully.');
  } catch (err) {
    next(err);
  }
};

/**
 * @route   PUT /api/v1/notes/:id
 * @access  Private (owner or admin)
 */
const updateNote = async (req, res, next) => {
  try {
    const note = await NoteModel.findById(req.params.id);
    if (!note) return sendError(res, 'Note not found.', 404);

    if (req.user.role !== 'admin' && note.user_id !== req.user.id) {
      return sendError(res, 'You do not have permission to update this note.', 403);
    }

    const { title, content, is_pinned, tags } = req.body;
    const updated = await NoteModel.update(req.params.id, { title, content, is_pinned, tags });

    logger.info(`Note updated: ${req.params.id} by user ${req.user.id}`);
    return sendSuccess(res, { note: updated }, 'Note updated successfully.');
  } catch (err) {
    next(err);
  }
};

/**
 * @route   DELETE /api/v1/notes/:id
 * @access  Private (owner or admin)
 */
const deleteNote = async (req, res, next) => {
  try {
    const note = await NoteModel.findById(req.params.id);
    if (!note) return sendError(res, 'Note not found.', 404);

    if (req.user.role !== 'admin' && note.user_id !== req.user.id) {
      return sendError(res, 'You do not have permission to delete this note.', 403);
    }

    await NoteModel.delete(req.params.id);
    logger.info(`Note deleted: ${req.params.id} by user ${req.user.id}`);
    return sendSuccess(res, {}, 'Note deleted successfully.');
  } catch (err) {
    next(err);
  }
};

module.exports = { createNote, getNotes, getNoteById, updateNote, deleteNote };
