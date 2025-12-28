const db = require('../config/database');

class TransactionItem {
  static async create(itemData) {
    const {
      transaction_id, book_id, type, quantity, price, subtotal,
      rent_duration, rent_start_date, rent_end_date
    } = itemData;

    const [result] = await db.execute(
      `INSERT INTO transaction_items 
       (transaction_id, book_id, type, quantity, price, subtotal, 
        rent_duration, rent_start_date, rent_end_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [transaction_id, book_id, type, quantity, price, subtotal,
       rent_duration, rent_start_date, rent_end_date]
    );
    return result.insertId;
  }

  static async findByTransactionId(transactionId) {
    const [rows] = await db.execute(
      `SELECT ti.*, b.title, b.author, b.image_url
       FROM transaction_items ti
       JOIN books b ON ti.book_id = b.id
       WHERE ti.transaction_id = ?`,
      [transactionId]
    );
    return rows;
  }

  static async updateStatus(id, status, approvedBy = null) {
    if (approvedBy) {
      await db.execute(
        'UPDATE transaction_items SET status = ?, approved_by = ?, approved_at = NOW() WHERE id = ?',
        [status, approvedBy, id]
      );
    } else {
      await db.execute('UPDATE transaction_items SET status = ? WHERE id = ?', [status, id]);
    }
  }

  static async markAsReturned(id, fineAmount = 0, lateDays = 0) {
    await db.execute(
      `UPDATE transaction_items 
       SET status = 'returned', actual_return_date = CURDATE(), 
           fine_amount = ?, late_days = ?
       WHERE id = ?`,
      [fineAmount, lateDays, id]
    );
  }

  static async findPendingApprovals() {
    const [rows] = await db.execute(
      `SELECT ti.*, t.transaction_code, t.user_id,
       u.name as customer_name, b.title as book_title
       FROM transaction_items ti
       JOIN transactions t ON ti.transaction_id = t.id
       JOIN users u ON t.user_id = u.id
       JOIN books b ON ti.book_id = b.id
       WHERE ti.status = 'pending' AND ti.type = 'rent'
       ORDER BY ti.created_at DESC`
    );
    return rows;
  }

  static async findOverdue() {
    const [rows] = await db.execute(
      `SELECT ti.*, t.transaction_code, t.user_id,
       u.name as customer_name, u.email, u.phone,
       b.title as book_title,
       DATEDIFF(CURDATE(), ti.rent_end_date) as days_overdue
       FROM transaction_items ti
       JOIN transactions t ON ti.transaction_id = t.id
       JOIN users u ON t.user_id = u.id
       JOIN books b ON ti.book_id = b.id
       WHERE ti.type = 'rent' 
       AND ti.status = 'approved' 
       AND ti.rent_end_date < CURDATE()
       AND ti.actual_return_date IS NULL`
    );
    return rows;
  }
}

module.exports = TransactionItem;
