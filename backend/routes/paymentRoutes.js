const express = require('express');
const router = express.Router();
const {
  mpesaConfirmation,
  mpesaValidation,
  mpesaRegisterUrl,
  recordBankPayment,
  recordCashPayment,
  getPaymentStats,
  bankWebhookHandler,
  registerBankWebhook,
  reconcileBankTransactions
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
// BANK WEBHOOKS (Public - Bank APIs only)
// ============================================
// These endpoints are called by bank APIs and should NOT require auth
// Supports: Equity Bank, KCB Bank, Co-operative Bank
router.post('/bank/webhook/:provider', bankWebhookHandler);

// ============================================
// PROTECTED ROUTES (Require authentication)
// ============================================
router.use(protect);

// M-PESA URL Registration (Admin only)
router.post('/register', mpesaRegisterUrl);

// Bank Integration Management (Admin only, requires tenant validation)
router.use(tenantMiddleware);
router.post('/bank/register/:provider', registerBankWebhook);
router.get('/bank/reconcile/:provider', reconcileBankTransactions);

// Manual payment recording
router.post('/bank', recordBankPayment);
router.post('/cash', recordCashPayment);
router.get('/stats', getPaymentStats);

module.exports = router;