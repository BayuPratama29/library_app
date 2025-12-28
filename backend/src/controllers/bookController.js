const Book = require('../models/Book');
const { successResponse, errorResponse, paginationResponse } = require('../utils/response');

const getAllBooks = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '', category_id = '' } = req.query;
    const offset = (page - 1) * limit;

    const filters = { search, category_id, limit, offset };
    const books = await Book.findAll(filters);
    const total = await Book.count({ search, category_id });

    const pagination = {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit)
    };

    paginationResponse(res, 'Books retrieved successfully', books, pagination);
  } catch (error) {
    next(error);
  }
};

const getBookById = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return errorResponse(res, 'Book not found', 404);
    }
    successResponse(res, 'Book retrieved successfully', book);
  } catch (error) {
    next(error);
  }
};

const createBook = async (req, res, next) => {
  try {
    const bookData = { ...req.body };
    
    // Handle image upload
    if (req.file) {
      bookData.image_url = `/uploads/books/${req.file.filename}`;
    }

    const bookId = await Book.create(bookData);
    successResponse(res, 'Book created successfully', { id: bookId }, 201);
  } catch (error) {
    next(error);
  }
};

const updateBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return errorResponse(res, 'Book not found', 404);
    }

    const bookData = { ...req.body };
    
    // Handle image upload
    if (req.file) {
      bookData.image_url = `/uploads/books/${req.file.filename}`;
    }

    await Book.update(req.params.id, bookData);
    successResponse(res, 'Book updated successfully');
  } catch (error) {
    next(error);
  }
};

const deleteBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return errorResponse(res, 'Book not found', 404);
    }

    await Book.delete(req.params.id);
    successResponse(res, 'Book deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook
};
