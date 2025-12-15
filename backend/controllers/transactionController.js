const Transaction = require('../models/Transaction');
const Student = require('../models/Student');

// @desc    Get all transactions
// @route   GET /api/transactions
// @access  Private
const getTransactions = async (req, res) => {
  try {
    const { status, source, type, startDate, endDate } = req.query;
    
    let query = {};
    
    if (status) query.status = status;
    if (source) query.source = source;
    if (type) query.type = type;
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    
    const transactions = await Transaction.find(query)
      .populate('student', 'admissionNumber name classLevel')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single transaction
// @route   GET /api/transactions/:id
// @access  Private
const getTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate('student', 'admissionNumber name classLevel guardianName guardianPhone');
    
    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }
    
    res.status(200).json({ success: true, data: transaction });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create manual transaction
// @route   POST /api/transactions
// @access  Private
const createTransaction = async (req, res) => {
  try {
    const { transactionId, amount, source, reference, type, metadata } = req.body;
    
    // Check if transaction ID already exists
    const existingTransaction = await Transaction.findOne({ transactionId });
    if (existingTransaction) {
      return res.status(400).json({ 
        success: false, 
        message: 'Transaction with this ID already exists' 
      });
    }
    
    // Try to find student by reference (admission number)
    let student = null;
    if (reference) {
      student = await Student.findOne({ 
        admissionNumber: reference.toUpperCase() 
      });
    }
    
    const transaction = await Transaction.create({
      transactionId,
      amount,
      source,
      reference,
      type: type || 'CREDIT',
      status: 'COMPLETED',
      student: student ? student._id : null,
      metadata: metadata || {}
    });
    
    // Update student balance if student found
    if (student) {
      if (type === 'DEBIT') {
        student.currentBalance += amount;
      } else {
        student.currentBalance -= amount;
      }
      await student.save();
    }
    
    const populatedTransaction = await Transaction.findById(transaction._id)
      .populate('student', 'admissionNumber name classLevel');
    
    res.status(201).json({ success: true, data: populatedTransaction });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get student transactions
// @route   GET /api/transactions/student/:studentId
// @access  Private
const getStudentTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ student: req.params.studentId })
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reverse transaction
// @route   PUT /api/transactions/:id/reverse
// @access  Private
const reverseTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    
    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }
    
    if (transaction.status === 'REVERSED') {
      return res.status(400).json({ 
        success: false, 
        message: 'Transaction already reversed' 
      });
    }
    
    transaction.status = 'REVERSED';
    await transaction.save();
    
    // Update student balance if student exists
    if (transaction.student) {
      const student = await Student.findById(transaction.student);
      if (student) {
        if (transaction.type === 'CREDIT') {
          student.currentBalance += transaction.amount;
        } else {
          student.currentBalance -= transaction.amount;
        }
        await student.save();
      }
    }
    
    res.status(200).json({ 
      success: true, 
      message: 'Transaction reversed successfully',
      data: transaction 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getTransactions,
  getTransaction,
  createTransaction,
  getStudentTransactions,
  reverseTransaction
};
