const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const authMiddleware = require('../middlewares/authMiddleware');
const { isAdmin } = require('../middlewares/roleMiddleware');
const { validateBook } = require('../validators/bookValidator');
const upload = require('../middlewares/uploadMiddleware');

router.get('/', bookController.getAllBooks);
router.get('/:id', bookController.getBookById);
router.post('/', authMiddleware, isAdmin, upload.single('bookImage'), validateBook, bookController.createBook);
router.put('/:id', authMiddleware, isAdmin, upload.single('bookImage'), validateBook, bookController.updateBook);
router.delete('/:id', authMiddleware, isAdmin, bookController.deleteBook);

module.exports = router;
