const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const authMiddleware = require('../middlewares/authMiddleware');
const { validateCart } = require('../validators/cartValidator');

router.get('/', authMiddleware, cartController.getCart);
router.post('/', authMiddleware, validateCart, cartController.addToCart);
router.put('/:id', authMiddleware, cartController.updateCartItem);
router.delete('/:id', authMiddleware, cartController.removeFromCart);
router.delete('/', authMiddleware, cartController.clearCart);

module.exports = router;