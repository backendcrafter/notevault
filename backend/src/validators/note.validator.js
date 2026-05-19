const { body, query, param } = require('express-validator');

const createNoteValidator = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required.')
    .isLength({ max: 255 }).withMessage('Title must be at most 255 characters.'),
  body('content')
    .optional()
    .trim()
    .isLength({ max: 50000 }).withMessage('Content is too long.'),
  body('is_pinned')
    .optional()
    .isBoolean().withMessage('is_pinned must be a boolean.'),
  body('tags')
    .optional()
    .isArray().withMessage('Tags must be an array.')
    .custom((tags) => tags.every((t) => typeof t === 'string' && t.length <= 50))
    .withMessage('Each tag must be a string of at most 50 characters.'),
];

const updateNoteValidator = [
  body('title')
    .optional()
    .trim()
    .notEmpty().withMessage('Title cannot be empty.')
    .isLength({ max: 255 }).withMessage('Title must be at most 255 characters.'),
  body('content')
    .optional()
    .trim()
    .isLength({ max: 50000 }).withMessage('Content is too long.'),
  body('is_pinned')
    .optional()
    .isBoolean().withMessage('is_pinned must be a boolean.'),
  body('tags')
    .optional()
    .isArray().withMessage('Tags must be an array.')
    .custom((tags) => tags.every((t) => typeof t === 'string' && t.length <= 50))
    .withMessage('Each tag must be a string of at most 50 characters.'),
];

const listNotesValidator = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer.'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100.'),
  query('search')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Search query too long.'),
];

module.exports = { createNoteValidator, updateNoteValidator, listNotesValidator };
