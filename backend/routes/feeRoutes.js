const express = require('express');
const router = express.Router();
const {
  getFees,
  getFee,
  createFee,
  updateFee,
  deleteFee,
  getFeesSummary
} = require('../controllers/feeController');
const { protect } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(protect);

router.route('/')
  .get(getFees)
  .post(createFee);

router.get('/summary/:academicYear', getFeesSummary);

router.route('/:id')
  .get(getFee)
  .put(updateFee)
  .delete(deleteFee);

module.exports = router;