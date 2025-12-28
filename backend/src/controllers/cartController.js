const Cart = require('../models/Cart');
const Book = require('../models/Book');
const { successResponse, errorResponse } = require('../utils/response');
const { TRANSACTION_TYPE } = require('../utils/constants');

const getCart = async (req, res, next) => {
  try {
    const cartItems = await Cart.findByUserId(req.user.id);
    
    // Calculate total
    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    successResponse(res, 'Cart retrieved successfully', {
      items: cartItems,
      total
    });
  } catch (error) {
    next(error);
  }
};

const addToCart = async (req, res, next) => {
  try {
    const { book_id, type, quantity, rent_duration } = req.body;

    // Check book availability
    const book = await Book.findById(book_id);
    if (!book) {
      return errorResponse(res, 'Book not found', 404);
    }

    if (book.available_quantity < quantity) {
      return errorResponse(res, 'Insufficient book stock', 400);
    }

    // Calculate price
    let price;
    if (type === TRANSACTION_TYPE.RENT) {
      price = book.rent_price_per_day * rent_duration * quantity;
    } else {
      price = book.purchase_price * quantity;
    }

    const cartData = {
      user_id: req.user.id,
      book_id,
      type,
      quantity,
      rent_duration: type === TRANSACTION_TYPE.RENT ? rent_duration : null,
      price
    };

    const cartId = await Cart.add(cartData);
    successResponse(res, 'Item added to cart successfully', { id: cartId }, 201);
  } catch (error) {
    next(error);
  }
};

const updateCartItem = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    const cartItem = await Cart.findById(req.params.id);

    if (!cartItem) {
      return errorResponse(res, 'Cart item not found', 404);
    }

    await Cart.update(req.params.id, quantity);
    successResponse(res, 'Cart item updated successfully');
  } catch (error) {
    next(error);
  }
};

const removeFromCart = async (req, res, next) => {
  try {
    const cartItem = await Cart.findById(req.params.id);
    if (!cartItem) {
      return errorResponse(res, 'Cart item not found', 404);
    }

    await Cart.delete(req.params.id);
    successResponse(res, 'Item removed from cart successfully');
  } catch (error) {
    next(error);
  }
};

const clearCart = async (req, res, next) => {
  try {
    await Cart.clearByUserId(req.user.id);
    successResponse(res, 'Cart cleared successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
};
