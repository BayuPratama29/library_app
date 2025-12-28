const { errorResponse } = require('../utils/response');
const { USER_ROLES } = require('../utils/constants');

const isAdmin = (req, res, next) => {
  if (req.user.role !== USER_ROLES.ADMIN) {
    return errorResponse(res, 'Access denied. Admin only.', 403);
  }
  next();
};

const isStudent = (req, res, next) => {
  if (req.user.role !== USER_ROLES.STUDENT) {
    return errorResponse(res, 'Access denied. Student only.', 403);
  }
  next();
};

module.exports = { isAdmin, isStudent };
