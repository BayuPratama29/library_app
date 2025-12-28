const USER_ROLES = {
  ADMIN: 'admin',
  STUDENT: 'student'
};

const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  CANCELLED: 'cancelled',
  EXPIRED: 'expired'
};

const TRANSACTION_ITEM_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  RETURNED: 'returned',
  OVERDUE: 'overdue'
};

const TRANSACTION_TYPE = {
  RENT: 'rent',
  PURCHASE: 'purchase'
};

const NOTIFICATION_TYPE = {
  TRANSACTION: 'transaction',
  REMINDER: 'reminder',
  SYSTEM: 'system'
};

module.exports = {
  USER_ROLES,
  PAYMENT_STATUS,
  TRANSACTION_ITEM_STATUS,
  TRANSACTION_TYPE,
  NOTIFICATION_TYPE
};