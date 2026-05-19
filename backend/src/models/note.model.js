const { query } = require('../config/database');

const NoteModel = {
  async create({ user_id, title, content = null, is_pinned = false, tags = [] }) {
    const result = await query(
      `INSERT INTO notes (user_id, title, content, is_pinned, tags)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [user_id, title, content, is_pinned, tags]
    );
    return result.rows[0];
  },

  async findAllByUser({ user_id, page = 1, limit = 10, search = '' }) {
    const offset = (page - 1) * limit;
    const searchParam = `%${search}%`;

    const result = await query(
      `SELECT * FROM notes
       WHERE user_id = $1
         AND ($4 = '' OR title ILIKE $4 OR content ILIKE $4)
       ORDER BY is_pinned DESC, updated_at DESC
       LIMIT $2 OFFSET $3`,
      [user_id, limit, offset, search ? searchParam : '']
    );

    const countResult = await query(
      `SELECT COUNT(*) FROM notes
       WHERE user_id = $1
         AND ($2 = '' OR title ILIKE $3 OR content ILIKE $3)`,
      [user_id, search, search ? searchParam : '']
    );

    return { notes: result.rows, total: parseInt(countResult.rows[0].count) };
  },

  async findAll({ page = 1, limit = 10, search = '' }) {
    const offset = (page - 1) * limit;
    const searchParam = `%${search}%`;

    const result = await query(
      `SELECT n.*, u.name AS author_name, u.email AS author_email
       FROM notes n
       JOIN users u ON n.user_id = u.id
       WHERE ($3 = '' OR n.title ILIKE $3 OR n.content ILIKE $3)
       ORDER BY n.updated_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset, search ? searchParam : '']
    );

    const countResult = await query(
      `SELECT COUNT(*) FROM notes WHERE ($1 = '' OR title ILIKE $2 OR content ILIKE $2)`,
      [search, search ? searchParam : '']
    );

    return { notes: result.rows, total: parseInt(countResult.rows[0].count) };
  },

  async findById(id) {
    const result = await query('SELECT * FROM notes WHERE id = $1', [id]);
    return result.rows[0] || null;
  },

  async update(id, { title, content, is_pinned, tags }) {
    const fields = [];
    const values = [];
    let idx = 1;

    if (title !== undefined) { fields.push(`title = $${idx++}`); values.push(title); }
    if (content !== undefined) { fields.push(`content = $${idx++}`); values.push(content); }
    if (is_pinned !== undefined) { fields.push(`is_pinned = $${idx++}`); values.push(is_pinned); }
    if (tags !== undefined) { fields.push(`tags = $${idx++}`); values.push(tags); }

    if (fields.length === 0) return null;

    values.push(id);
    const result = await query(
      `UPDATE notes SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    );
    return result.rows[0] || null;
  },

  async delete(id) {
    const result = await query('DELETE FROM notes WHERE id = $1 RETURNING id', [id]);
    return result.rows[0] || null;
  },
};

module.exports = NoteModel;
