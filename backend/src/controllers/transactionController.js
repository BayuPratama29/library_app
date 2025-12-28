const Transaction = require('../models/Transaction');
const TransactionItem = require('../models/TransactionItem');
const Cart = require('../models/Cart');
const Book = require('../models/Book');
const { generateTransactionCode, calculateFine } = require('../utils/helpers');
const { successResponse, errorResponse } = require('../utils/response');
const { TRANSACTION_TYPE, PAYMENT_STATUS } = require('../utils/constants');
const db = require('../config/database');

const checkout = async (req, res, next) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    // Get cart items
    const cartItems = await Cart.findByUserId(req.user.id);
    if (cartItems.length === 0) {
      return errorResponse(res, 'Cart is empty', 400);
    }

    // Calculate total
    const totalAmount = cartItems.reduce((sum, item) => {
      return sum + (item.price * item.quantity);
    }, 0);

    // Generate transaction code
    const transactionCode = generateTransactionCode();

    // Create transaction
    const transactionId = await Transaction.create({
      transaction_code: transactionCode,
      user_id: req.user.id,
      total_amount: totalAmount,
      notes: req.body.notes || null
    });

    // Create transaction items
    for (const item of cartItems) {
      let rentStartDate = null;
      let rentEndDate = null;

      if (item.type === TRANSACTION_TYPE.RENT) {
        rentStartDate = new Date();
        rentEndDate = new Date();
        rentEndDate.setDate(rentEndDate.getDate() + item.rent_duration);
      }

      await TransactionItem.create({
        transaction_id: transactionId,
        book_id: item.book_id,
        type: item.type,
        quantity: item.quantity,
        price: item.price / item.quantity,
        subtotal: item.price,
        rent_duration: item.rent_duration,
        rent_start_date: rentStartDate,
        rent_end_date: rentEndDate
      });

      // Update book stock for purchases
      if (item.type === TRANSACTION_TYPE.PURCHASE) {
        await Book.updateStock(item.book_id, item.quantity);
      }
    }

    // Clear cart
    await Cart.clearByUserId(req.user.id);

    await connection.commit();

    successResponse(res, 'Checkout successful', {
      transaction_id: transactionId,
      transaction_code: transactionCode,
      total_amount: totalAmount
    }, 201);

  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};

const uploadPaymentProof = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    
    if (!transaction) {
      return errorResponse(res, 'Transaction not found', 404);
    }

    if (transaction.user_id !== req.user.id) {
      return errorResponse(res, 'Unauthorized', 403);
    }

    if (!req.file) {
      return errorResponse(res, 'Payment proof is required', 400);
    }

    const paymentProof = `/uploads/payments/${req.file.filename}`;
    
    await Transaction.updatePaymentStatus(req.params.id, PAYMENT_STATUS.PENDING, {
      payment_method: req.body.payment_method,
      payment_proof: paymentProof
    });

    successResponse(res, 'Payment proof uploaded successfully');
  } catch (error) {
    next(error);
  }
};

const getMyTransactions = async (req, res, next) => {
  try {
    const { payment_status } = req.query;
    const transactions = await Transaction.findByUserId(req.user.id, { payment_status });

    // Get items for each transaction
    for (let transaction of transactions) {
      transaction.items = await TransactionItem.findByTransactionId(transaction.id);
    }

    successResponse(res, 'Transactions retrieved successfully', transactions);
  } catch (error) {
    next(error);
  }
};

const getTransactionDetail = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    
    if (!transaction) {
      return errorResponse(res, 'Transaction not found', 404);
    }

    if (req.user.role !== 'admin' && transaction.user_id !== req.user.id) {
      return errorResponse(res, 'Unauthorized', 403);
    }

    transaction.items = await TransactionItem.findByTransactionId(transaction.id);

    successResponse(res, 'Transaction detail retrieved successfully', transaction);
  } catch (error) {
    next(error);
  }
};

const getAllTransactions = async (req, res, next) => {
  try {
    const { payment_status, search } = req.query;
    const transactions = await Transaction.findAll({ payment_status, search });

    successResponse(res, 'Transactions retrieved successfully', transactions);
  } catch (error) {
    next(error);
  }
};

const approveTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    
    if (!transaction) {
      return errorResponse(res, 'Transaction not found', 404);
    }

    await Transaction.updatePaymentStatus(req.params.id, PAYMENT_STATUS.PAID, {});

    // Approve all rent items
    const items = await TransactionItem.findByTransactionId(req.params.id);
    for (const item of items) {
      if (item.type === TRANSACTION_TYPE.RENT) {
        await TransactionItem.updateStatus(item.id, 'approved', req.user.id);
      }
    }

    successResponse(res, 'Transaction approved successfully');
  } catch (error) {
    next(error);
  }
};

const rejectTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    
    if (!transaction) {
      return errorResponse(res, 'Transaction not found', 404);
    }

    await Transaction.updatePaymentStatus(req.params.id, PAYMENT_STATUS.CANCELLED, {});

    // Reject all rent items
    const items = await TransactionItem.findByTransactionId(req.params.id);
    for (const item of items) {
      if (item.type === TRANSACTION_TYPE.RENT) {
        await TransactionItem.updateStatus(item.id, 'rejected');
      }
    }

    // Add admin notes if provided
    if (req.body.notes) {
      await Transaction.addAdminNotes(req.params.id, req.body.notes);
    }

    successResponse(res, 'Transaction rejected successfully');
  } catch (error) {
    next(error);
  }
};

const returnBook = async (req, res, next) => {
  try {
    const itemId = req.params.itemId;
    const items = await TransactionItem.findByTransactionId(req.params.id);
    const item = items.find(i => i.id == itemId);

    if (!item) {
      return errorResponse(res, 'Transaction item not found', 404);
    }

    if (item.status !== 'approved') {
      return errorResponse(res, 'Item is not approved for return', 400);
    }

    // Calculate fine if overdue
    const { lateDays, fineAmount } = calculateFine(item.rent_end_date);

    await TransactionItem.markAsReturned(itemId, fineAmount, lateDays);

    // Return stock
    await Book.updateStock(item.book_id, -item.quantity);

    successResponse(res, 'Book returned successfully', {
      late_days: lateDays,
      fine_amount: fineAmount
    });
  } catch (error) {
    next(error);
  }
};

const getPendingApprovals = async (req, res, next) => {
  try {
    const items = await TransactionItem.findPendingApprovals();
    successResponse(res, 'Pending approvals retrieved successfully', items);
  } catch (error) {
    next(error);
  }
};

const getOverdueRentals = async (req, res, next) => {
  try {
    const items = await TransactionItem.findOverdue();
    
    // Calculate fines
    const finePerDay = parseInt(process.env.FINE_PER_DAY) || 2000;
    items.forEach(item => {
      item.fine_amount = item.days_overdue * finePerDay;
    });

    successResponse(res, 'Overdue rentals retrieved successfully', items);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  checkout,
  uploadPaymentProof,
  getMyTransactions,
  getTransactionDetail,
  getAllTransactions,
  approveTransaction,
  rejectTransaction,
  returnBook,
  getPendingApprovals,
  getOverdueRentals
};