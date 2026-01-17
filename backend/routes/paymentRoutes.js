const express = require('express');
const router = express.Router();
const {
  mpesaConfirmation,
  mpesaValidation,
  mpesaRegisterUrl,
  recordBankPayment,
  recordCashPayment,
  getPaymentStats
} = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');
const { tenantMiddleware } = require('../middleware/tenantMiddleware');

// ============================================
// M-PESA C2B CALLBACKS (Public - Safaricom only)
// ============================================
// These endpoints are called by Safaricom and should NOT require auth
router.post('/validation', mpesaValidation);
router.post('/confirmation', mpesaConfirmation);

// ============================================
// PROTECTED ROUTES (Require authentication)
// ============================================
router.use(protect);

// M-PESA URL Registration (Admin only)
router.post('/register', mpesaRegisterUrl);

// Manual payment recording (requires tenant validation)
router.use(tenantMiddleware);

router.post('/bank', recordBankPayment);
router.post('/cash', recordCashPayment);
router.get('/stats', getPaymentStats);

module.exports = router;