const Transaction = require('../models/Transaction');
const Student = require('../models/Student');

// @desc    Process M-PESA payment (called by Daraja callback)
// @route   POST /api/payments/mpesa/callback
// @access  Public (but should validate with callback signature)
const processMpesaPayment = async (req, res) => {
  try {
    // This will be called by Safaricom's Daraja API
    const { Body } = req.body;
    
    if (!Body || !Body.stkCallback) {
      return res.status(400).json({ success: false, message: 'Invalid callback data' });
    }
    
    const { ResultCode, ResultDesc, CallbackMetadata } = Body.stkCallback;
    
    // Extract payment details from callback metadata
    let amount = 0;
    let mpesaReceiptNumber = '';
    let phoneNumber = '';
    
    if (CallbackMetadata && CallbackMetadata.Item) {
      CallbackMetadata.Item.forEach(item => {
        if (item.Name === 'Amount') amount = item.Value;
        if (item.Name === 'MpesaReceiptNumber') mpesaReceiptNumber = item.Value;
        if (item.Name === 'PhoneNumber') phoneNumber = item.Value;
      });
    }
    
    // ResultCode 0 means success
    if (ResultCode === 0) {
      // Try to match payment to student by phone number
      const student = await Student.findOne({ guardianPhone: `254${phoneNumber.slice(-9)}` });
      
      const transaction = await Transaction.create({
        transactionId: mpesaReceiptNumber,
        amount,
        source: 'MPESA',
        reference: student ? student.admissionNumber : 'SUSPENSE',
        type: 'CREDIT',
        status: 'COMPLETED',
        student: student ? student._id : null,
        metadata: req.body
      });
      
      // Update student balance if found
      if (student) {
        student.currentBalance -= amount;
        await student.save();
      }
      
      res.status(200).json({ success: true, message: 'Payment processed', data: transaction });
    } else {
      res.status(200).json({ success: false, message: ResultDesc });
    }
  } catch (error) {
    console.error('M-PESA callback error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Initiate M-PESA STK Push
// @route   POST /api/payments/mpesa/stk-push
// @access  Private
const initiateMpesaPayment = async (req, res) => {
  try {
    const { phoneNumber, amount, accountReference } = req.body;
    
    // This will call the M-PESA service
    // For now, return placeholder response
    res.status(200).json({
      success: true,
      message: 'STK Push initiated',
      data: {
        phoneNumber,
        amount,
        accountReference
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Record bank payment
// @route   POST /api/payments/bank
// @access  Private
const recordBankPayment = async (req, res) => {
  try {
    const { transactionId, amount, reference, source } = req.body;
    
    // Check if transaction already exists
    const existingTransaction = await Transaction.findOne({ transactionId });
    if (existingTransaction) {
      return res.status(400).json({ 
        success: false, 
        message: 'Transaction already recorded' 
      });
    }
    
    // Find student by admission number
    const student = await Student.findOne({ 
      admissionNumber: reference.toUpperCase() 
    });
    
    if (!student) {
      return res.status(404).json({ 
        success: false, 
        message: 'Student not found with this admission number' 
      });
    }
    
    const transaction = await Transaction.create({
      transactionId,
      amount,
      source: source || 'BANK_TRANSFER',
      reference,
      type: 'CREDIT',
      status: 'COMPLETED',
      student: student._id,
      metadata: req.body
    });
    
    // Update student balance
    student.currentBalance -= amount;
    await student.save();
    
    const populatedTransaction = await Transaction.findById(transaction._id)
      .populate('student', 'admissionNumber name classLevel');
    
    res.status(201).json({ 
      success: true, 
      message: 'Bank payment recorded successfully',
      data: populatedTransaction 
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Record cash payment
// @route   POST /api/payments/cash
// @access  Private
const recordCashPayment = async (req, res) => {
  try {
    const { amount, reference, receiptNumber } = req.body;
    
    const student = await Student.findOne({ 
      admissionNumber: reference.toUpperCase() 
    });
    
    if (!student) {
      return res.status(404).json({ 
        success: false, 
        message: 'Student not found' 
      });
    }
    
    const transaction = await Transaction.create({
      transactionId: receiptNumber || `CASH-${Date.now()}`,
      amount,
      source: 'CASH',
      reference,
      type: 'CREDIT',
      status: 'COMPLETED',
      student: student._id,
      metadata: { recordedBy: req.user._id }
    });
    
    student.currentBalance -= amount;
    await student.save();
    
    const populatedTransaction = await Transaction.findById(transaction._id)
      .populate('student', 'admissionNumber name classLevel');
    
    res.status(201).json({ 
      success: true, 
      data: populatedTransaction 
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get payment statistics
// @route   GET /api/payments/stats
// @access  Private
const getPaymentStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }
    
    const stats = await Transaction.aggregate([
      { $match: { ...dateFilter, type: 'CREDIT', status: 'COMPLETED' } },
      {
        $group: {
          _id: '$source',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);
    
    const totalRevenue = await Transaction.aggregate([
      { $match: { ...dateFilter, type: 'CREDIT', status: 'COMPLETED' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        bySource: stats,
        totalRevenue: totalRevenue[0]?.total || 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  processMpesaPayment,
  initiateMpesaPayment,
  recordBankPayment,
  recordCashPayment,
  getPaymentStats
};
