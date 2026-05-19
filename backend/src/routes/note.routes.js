const express = require('express');
const router = express.Router();
const {
  createNote, getNotes, getNoteById, updateNote, deleteNote,
} = require('../controllers/note.controller');
const { authenticate } = require('../middleware/auth');
const { createNoteValidator, updateNoteValidator, listNotesValidator } = require('../validators/note.validator');
const { validate } = require('../middleware/validate');

// All note routes require authentication
router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Notes
 *   description: Note CRUD operations
 */

/**
 * @swagger
 * /api/v1/notes:
 *   get:
 *     summary: Get all notes (own notes for user; all notes for admin)
 *     tags: [Notes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Paginated list of notes
 *       401:
 *         description: Unauthorized
 */
router.get('/', listNotesValidator, validate, getNotes);

/**
 * @swagger
 * /api/v1/notes/{id}:
 *   get:
 *     summary: Get a note by ID
 *     tags: [Notes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Note found
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Note not found
 */
router.get('/:id', getNoteById);

/**
 * @swagger
 * /api/v1/notes:
 *   post:
 *     summary: Create a new note
 *     tags: [Notes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title]
 *             properties:
 *               title: { type: string, example: "My Note" }
 *               content: { type: string, example: "Note content here" }
 *               is_pinned: { type: boolean, example: false }
 *               tags: { type: array, items: { type: string }, example: ["work", "ideas"] }
 *     responses:
 *       201:
 *         description: Note created
 *       422:
 *         description: Validation error
 */
router.post('/', createNoteValidator, validate, createNote);

/**
 * @swagger
 * /api/v1/notes/{id}:
 *   put:
 *     summary: Update a note
 *     tags: [Notes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string }
 *               content: { type: string }
 *               is_pinned: { type: boolean }
 *               tags: { type: array, items: { type: string } }
 *     responses:
 *       200:
 *         description: Note updated
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Note not found
 */
router.put('/:id', updateNoteValidator, validate, updateNote);

/**
 * @swagger
 * /api/v1/notes/{id}:
 *   delete:
 *     summary: Delete a note
 *     tags: [Notes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Note deleted
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Note not found
 */
router.delete('/:id', deleteNote);

module.exports = router;
