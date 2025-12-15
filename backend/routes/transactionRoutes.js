const express = require('express');
const router = express.Router();
const {
  getTransactions,
  getTransaction,
  createTransaction,
  getStudentTransactions,
  reverseTransaction
} = require('../controllers/transactionController');
const { protect } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(protect);

router.route('/')
  .get(getTransactions)
  .post(createTransaction);

router.route('/:id')
  .get(getTransaction);

router.put('/:id/reverse', reverseTransaction);

router.get('/student/:studentId', getStudentTransactions);

module.exports = router;