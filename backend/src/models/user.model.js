const { query } = require('../config/database');
const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 12;

const UserModel = {
  async create({ name, email, password, role = 'user' }) {
    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
    const result = await query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, role, is_active, created_at`,
      [name, email, password_hash, role]
    );
    return result.rows[0];
  },

  async findByEmail(email) {
    const result = await query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0] || null;
  },

  async findById(id) {
    const result = await query(
      'SELECT id, name, email, role, is_active, created_at, updated_at FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  },

  async findAll({ page = 1, limit = 10 }) {
    const offset = (page - 1) * limit;
    const result = await query(
      `SELECT id, name, email, role, is_active, created_at FROM users
       ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    const count = await query('SELECT COUNT(*) FROM users');
    return { users: result.rows, total: parseInt(count.rows[0].count) };
  },

  async updateStatus(id, is_active) {
    const result = await query(
      `UPDATE users SET is_active = $1 WHERE id = $2
       RETURNING id, name, email, role, is_active, updated_at`,
      [is_active, id]
    );
    return result.rows[0] || null;
  },

  async verifyPassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  },
};

module.exports = UserModel;
