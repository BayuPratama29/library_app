const bcrypt = require('bcryptjs');

const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

const generateTransactionCode = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(10000 + Math.random() * 90000);
  return `TRX-${year}${month}${day}-${random}`;
};

const calculateFine = (rentEndDate) => {
  const today = new Date();
  const endDate = new Date(rentEndDate);
  const diffTime = today - endDate;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays <= 0) return { lateDays: 0, fineAmount: 0 };
  
  const finePerDay = parseInt(process.env.FINE_PER_DAY) || 2000;
  return {
    lateDays: diffDays,
    fineAmount: diffDays * finePerDay
  };
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR'
  }).format(amount);
};

module.exports = {
  hashPassword,
  comparePassword,
  generateTransactionCode,
  calculateFine,
  formatCurrency
};
