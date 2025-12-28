const Category = require('../models/Category');
const { successResponse, errorResponse } = require('../utils/response');

const getAllCategories = async (req, res, next) => {
  try {
    const categories = await Category.findAll();
    successResponse(res, 'Categories retrieved successfully', categories);
  } catch (error) {
    next(error);
  }
};

const createCategory = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const categoryId = await Category.create({ name, description });
    successResponse(res, 'Category created successfully', { id: categoryId }, 201);
  } catch (error) {
    next(error);
  }
};

const updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return errorResponse(res, 'Category not found', 404);
    }

    const { name, description } = req.body;
    await Category.update(req.params.id, { name, description });
    successResponse(res, 'Category updated successfully');
  } catch (error) {
    next(error);
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return errorResponse(res, 'Category not found', 404);
    }

    await Category.delete(req.params.id);
    successResponse(res, 'Category deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory
};
