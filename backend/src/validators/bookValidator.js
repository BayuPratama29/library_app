const Joi = require('joi');

const bookSchema = Joi.object({
  title: Joi.string().min(1).max(255).required(),
  author: Joi.string().min(1).max(100).required(),
  isbn: Joi.string().max(20).optional().allow('', null),
  publisher: Joi.string().max(100).optional().allow('', null),
  published_year: Joi.number().integer().min(1900).max(new Date().getFullYear()).optional().allow(null),
  category_id: Joi.number().integer().optional().allow(null),
  description: Joi.string().optional().allow('', null),
  stock_quantity: Joi.number().integer().min(0).required(),
  rent_price_per_day: Joi.number().min(0).required(),
  purchase_price: Joi.number().min(0).required()
});

const validateBook = (req, res, next) => {
  const { error } = bookSchema.validate(req.body);
  if (error) {
    error.isJoi = true;
    return next(error);
  }
  next();
};

module.exports = { validateBook };
