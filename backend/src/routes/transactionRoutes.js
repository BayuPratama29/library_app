const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const authMiddleware = require('../middlewares/authMiddleware');
const { isAdmin } = require('../middlewares/roleMiddleware');
const upload = require('../middlewares/uploadMiddleware');

// Student routes
router.post('/checkout', authMiddleware, transactionController.checkout);
router.post('/:id/payment', authMiddleware, upload.single('paymentProof'), transactionController.uploadPaymentProof);
router.get('/my-transactions', authMiddleware, transactionController.getMyTransactions);
router.get('/:id', authMiddleware, transactionController.getTransactionDetail);

// Admin routes
router.get('/', authMiddleware, isAdmin, transactionController.getAllTransactions);
router.put('/:id/approve', authMiddleware, isAdmin, transactionController.approveTransaction);
router.put('/:id/reject', authMiddleware, isAdmin, transactionController.rejectTransaction);
router.put('/:id/items/:itemId/return', authMiddleware, isAdmin, transactionController.returnBook);
router.get('/admin/pending-approvals', authMiddleware, isAdmin, transactionController.getPendingApprovals);
router.get('/admin/overdue-rentals', authMiddleware, isAdmin, transactionController.getOverdueRentals);

module.exports = router;

const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

module.exports = {
  generateToken,
  verifyToken,
  JWT_SECRET,
  JWT_EXPIRES_IN
};
