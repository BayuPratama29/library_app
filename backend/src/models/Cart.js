const db = require('../config/database');

class Cart {
  static async findByUserId(userId) {
    const [rows] = await db.execute(
      `SELECT c.*, b.title, b.author, b.image_url, b.available_quantity,
       b.rent_price_per_day, b.purchase_price
       FROM carts c
       JOIN books b ON c.book_id = b.id
       WHERE c.user_id = ?`,
      [userId]
    );
    return rows;
  }

  static async add(cartData) {
    const { user_id, book_id, type, quantity, rent_duration, price } = cartData;
    
    // Check if item already exists
    const [existing] = await db.execute(
      'SELECT * FROM carts WHERE user_id = ? AND book_id = ? AND type = ?',
      [user_id, book_id, type]
    );

    if (existing.length > 0) {
      // Update quantity
      await db.execute(
        'UPDATE carts SET quantity = quantity + ? WHERE id = ?',
        [quantity, existing[0].id]
      );
      return existing[0].id;
    }

    // Insert new item
    const [result] = await db.execute(
      'INSERT INTO carts (user_id, book_id, type, quantity, rent_duration, price) VALUES (?, ?, ?, ?, ?, ?)',
      [user_id, book_id, type, quantity, rent_duration, price]
    );
    return result.insertId;
  }

  static async update(id, quantity) {
    await db.execute('UPDATE carts SET quantity = ? WHERE id = ?', [quantity, id]);
  }

  static async delete(id) {
    await db.execute('DELETE FROM carts WHERE id = ?', [id]);
  }

  static async clearByUserId(userId) {
    await db.execute('DELETE FROM carts WHERE user_id = ?', [userId]);
  }

  static async findById(id) {
    const [rows] = await db.execute('SELECT * FROM carts WHERE id = ?', [id]);
    return rows[0];
  }
}

module.exports = Cart;
