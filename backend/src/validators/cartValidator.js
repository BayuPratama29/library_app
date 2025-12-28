const Joi = require('joi');
const { TRANSACTION_TYPE } = require('../utils/constants');

const cartSchema = Joi.object({
  book_id: Joi.number().integer().required(),
  type: Joi.string().valid(TRANSACTION_TYPE.RENT, TRANSACTION_TYPE.PURCHASE).required(),
  quantity: Joi.number().integer().min(1).required(),
  rent_duration: Joi.number().integer().min(1).when('type', {
    is: TRANSACTION_TYPE.RENT,
    then: Joi.required(),
    otherwise: Joi.optional().allow(null)
  })
});

const validateCart = (req, res, next) => {
  const { error } = cartSchema.validate(req.body);
  if (error) {
    error.isJoi = true;
    return next(error);
  }
  next();
};

module.exports = { validateCart };
