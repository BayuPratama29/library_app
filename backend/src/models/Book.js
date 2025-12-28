const db = require('../config/database');

class Book {
  static async findAll(filters = {}) {
    let query = `
      SELECT b.*, c.name as category_name 
      FROM books b 
      LEFT JOIN categories c ON b.category_id = c.id 
      WHERE b.is_available = 1
    `;
    const params = [];

    if (filters.search) {
      query += ' AND (b.title LIKE ? OR b.author LIKE ?)';
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }

    if (filters.category_id) {
      query += ' AND b.category_id = ?';
      params.push(filters.category_id);
    }

    query += ' ORDER BY b.created_at DESC';

    if (filters.limit && filters.offset !== undefined) {
      query += ' LIMIT ? OFFSET ?';
      params.push(parseInt(filters.limit), parseInt(filters.offset));
    }

    const [rows] = await db.execute(query, params);
    return rows;
  }

  static async count(filters = {}) {
    let query = 'SELECT COUNT(*) as total FROM books WHERE is_available = 1';
    const params = [];

    if (filters.search) {
      query += ' AND (title LIKE ? OR author LIKE ?)';
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }

    if (filters.category_id) {
      query += ' AND category_id = ?';
      params.push(filters.category_id);
    }

    const [rows] = await db.execute(query, params);
    return rows[0].total;
  }

  static async findById(id) {
    const [rows] = await db.execute(
      `SELECT b.*, c.name as category_name 
       FROM books b 
       LEFT JOIN categories c ON b.category_id = c.id 
       WHERE b.id = ?`,
      [id]
    );
    return rows[0];
  }

  static async create(bookData) {
    const {
      title, author, isbn, publisher, published_year, category_id,
      description, stock_quantity, rent_price_per_day, purchase_price, image_url
    } = bookData;

    const [result] = await db.execute(
      `INSERT INTO books 
       (title, author, isbn, publisher, published_year, category_id, description, 
        stock_quantity, available_quantity, rent_price_per_day, purchase_price, image_url) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, author, isbn, publisher, published_year, category_id, description,
       stock_quantity, stock_quantity, rent_price_per_day, purchase_price, image_url]
    );
    return result.insertId;
  }

  static async update(id, bookData) {
    const {
      title, author, isbn, publisher, published_year, category_id,
      description, stock_quantity, rent_price_per_day, purchase_price, image_url
    } = bookData;

    await db.execute(
      `UPDATE books SET 
       title = ?, author = ?, isbn = ?, publisher = ?, published_year = ?,
       category_id = ?, description = ?, stock_quantity = ?,
       rent_price_per_day = ?, purchase_price = ?, image_url = ?
       WHERE id = ?`,
      [title, author, isbn, publisher, published_year, category_id, description,
       stock_quantity, rent_price_per_day, purchase_price, image_url, id]
    );
  }

  static async delete(id) {
    await db.execute('UPDATE books SET is_available = 0 WHERE id = ?', [id]);
  }

  static async updateStock(id, quantity) {
    await db.execute(
      'UPDATE books SET available_quantity = available_quantity - ? WHERE id = ?',
      [quantity, id]
    );
  }
}

module.exports = Book;
