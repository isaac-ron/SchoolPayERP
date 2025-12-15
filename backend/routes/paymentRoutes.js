const express = require('express');
const router = express.Router();
const {
  processMpesaPayment,
  initiateMpesaPayment,
  recordBankPayment,
  recordCashPayment,
  getPaymentStats
} = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

// M-PESA callback route (public - called by Safaricom)
router.post('/mpesa/callback', processMpesaPayment);

// Protected routes
router.use(protect);

router.post('/mpesa/stk-push', initiateMpesaPayment);
router.post('/bank', recordBankPayment);
router.post('/cash', recordCashPayment);
router.get('/stats', getPaymentStats);

module.exports = router;