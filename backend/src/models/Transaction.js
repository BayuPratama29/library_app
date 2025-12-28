const db = require('../config/database');

class Transaction {
  static async create(transactionData) {
    const { transaction_code, user_id, total_amount, notes } = transactionData;
    const [result] = await db.execute(
      'INSERT INTO transactions (transaction_code, user_id, total_amount, notes) VALUES (?, ?, ?, ?)',
      [transaction_code, user_id, total_amount, notes]
    );
    return result.insertId;
  }

  static async findById(id) {
    const [rows] = await db.execute(
      `SELECT t.*, u.name as customer_name, u.email as customer_email
       FROM transactions t
       JOIN users u ON t.user_id = u.id
       WHERE t.id = ?`,
      [id]
    );
    return rows[0];
  }

  static async findByUserId(userId, filters = {}) {
    let query = `
      SELECT t.*, COUNT(ti.id) as total_items
      FROM transactions t
      LEFT JOIN transaction_items ti ON t.id = ti.transaction_id
      WHERE t.user_id = ?
    `;
    const params = [userId];

    if (filters.payment_status) {
      query += ' AND t.payment_status = ?';
      params.push(filters.payment_status);
    }

    query += ' GROUP BY t.id ORDER BY t.created_at DESC';

    const [rows] = await db.execute(query, params);
    return rows;
  }

  static async findAll(filters = {}) {
    let query = `
      SELECT t.*, u.name as customer_name, u.email as customer_email,
      COUNT(ti.id) as total_items
      FROM transactions t
      JOIN users u ON t.user_id = u.id
      LEFT JOIN transaction_items ti ON t.id = ti.transaction_id
      WHERE 1=1
    `;
    const params = [];

    if (filters.payment_status) {
      query += ' AND t.payment_status = ?';
      params.push(filters.payment_status);
    }

    if (filters.search) {
      query += ' AND (t.transaction_code LIKE ? OR u.name LIKE ?)';
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }

    query += ' GROUP BY t.id ORDER BY t.created_at DESC';

    const [rows] = await db.execute(query, params);
    return rows;
  }

  static async updatePaymentStatus(id, status, paymentData = {}) {
    const { payment_method, payment_proof } = paymentData;
    await db.execute(
      `UPDATE transactions 
       SET payment_status = ?, payment_method = ?, payment_proof = ?, payment_date = NOW()
       WHERE id = ?`,
      [status, payment_method, payment_proof, id]
    );
  }

  static async addAdminNotes(id, notes) {
    await db.execute('UPDATE transactions SET admin_notes = ? WHERE id = ?', [notes, id]);
  }
}

module.exports = Transaction;
