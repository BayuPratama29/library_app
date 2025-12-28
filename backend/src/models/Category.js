const db = require('../config/database');

class Category {
  static async findAll() {
    const [rows] = await db.execute('SELECT * FROM categories ORDER BY name');
    return rows;
  }

  static async findById(id) {
    const [rows] = await db.execute('SELECT * FROM categories WHERE id = ?', [id]);
    return rows[0];
  }

  static async create(categoryData) {
    const { name, description } = categoryData;
    const [result] = await db.execute(
      'INSERT INTO categories (name, description) VALUES (?, ?)',
      [name, description]
    );
    return result.insertId;
  }

  static async update(id, categoryData) {
    const { name, description } = categoryData;
    await db.execute(
      'UPDATE categories SET name = ?, description = ? WHERE id = ?',
      [name, description, id]
    );
  }

  static async delete(id) {
    await db.execute('DELETE FROM categories WHERE id = ?', [id]);
  }
}

module.exports = Category;
