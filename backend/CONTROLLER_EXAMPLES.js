/**
 * Example Controller Updates for Multi-Tenant Architecture
 * 
 * This file shows how to update existing controllers to support multi-tenancy.
 * Copy these patterns to your actual controllers.
 */

const Student = require('../models/Student');
const Transaction = require('../models/Transaction');
const Fee = require('../models/Fee');
const { addSchoolFilter } = require('../middleware/tenantMiddleware');

// ============================================
// STUDENT CONTROLLER EXAMPLES
// ============================================

/**
 * Get all students (with school filtering)
 */
exports.getStudents = async (req, res) => {
  try {
    const { classLevel, status, search } = req.query;
    
    // Build base filter
    let filter = {};
    if (classLevel) filter.classLevel = classLevel;
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { admissionNumber: { $regex: search, $options: 'i' } }
      ];
    }

    // Add school scope (CRITICAL!)
    filter = addSchoolFilter(req, filter);

    const students = await Student.find(filter)
      .sort({ admissionNumber: 1 })
      .select('-__v');

    res.json({
      success: true,
      count: students.length,
      school: req.school.name,
      data: students
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get single student by ID
 */
exports.getStudent = async (req, res) => {
  try {
    // validateResourceOwnership middleware already checked ownership
    const student = await Student.findOne({
      _id: req.params.id,
      school: req.school._id
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    res.json({
      success: true,
      data: student
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Create new student
 */
exports.createStudent = async (req, res) => {
  try {
    // Check for duplicate admission number in THIS school
    const existingStudent = await Student.findOne({
      school: req.school._id,
      admissionNumber: req.body.admissionNumber
    });

    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message: 'Admission number already exists in your school'
      });
    }

    // Create student with school reference
    const student = await Student.create({
      ...req.body,
      school: req.school._id  // CRITICAL - Always add school
    });

    res.status(201).json({
      success: true,
      message: 'Student created successfully',
      data: student
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Update student
 */
exports.updateStudent = async (req, res) => {
  try {
    // validateResourceOwnership middleware ensures this student belongs to user's school
    
    // Check if admission number is being changed
    if (req.body.admissionNumber) {
      const existingStudent = await Student.findOne({
        school: req.school._id,
        admissionNumber: req.body.admissionNumber,
        _id: { $ne: req.params.id }  // Exclude current student
      });

      if (existingStudent) {
        return res.status(400).json({
          success: false,
          message: 'Admission number already exists in your school'
        });
      }
    }

    // Don't allow changing school
    delete req.body.school;

    const student = await Student.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Student updated successfully',
      data: student
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Delete student
 */
exports.deleteStudent = async (req, res) => {
  try {
    // validateResourceOwnership middleware ensures this student belongs to user's school
    
    await Student.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Student deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ============================================
// FEE CONTROLLER EXAMPLES
// ============================================

/**
 * Get all fees for school
 */
exports.getFees = async (req, res) => {
  try {
    const { academicYear, term, type, isActive } = req.query;
    
    let filter = {};
    if (academicYear) filter.academicYear = academicYear;
    if (term) filter.term = term;
    if (type) filter.type = type;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    // Add school scope
    filter = addSchoolFilter(req, filter);

    const fees = await Fee.find(filter)
      .sort({ academicYear: -1, term: 1 })
      .select('-__v');

    res.json({
      success: true,
      count: fees.length,
      school: req.school.name,
      data: fees
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Create new fee
 */
exports.createFee = async (req, res) => {
  try {
    // Create fee with school reference
    const fee = await Fee.create({
      ...req.body,
      school: req.school._id
    });

    res.status(201).json({
      success: true,
      message: 'Fee created successfully',
      data: fee
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ============================================
// TRANSACTION CONTROLLER EXAMPLES
// ============================================

/**
 * Get all transactions for school
 */
exports.getTransactions = async (req, res) => {
  try {
    const { studentId, status, source, startDate, endDate } = req.query;
    
    let filter = {};
    if (studentId) filter.student = studentId;
    if (status) filter.status = status;
    if (source) filter.source = source;
    
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    // Add school scope
    filter = addSchoolFilter(req, filter);

    const transactions = await Transaction.find(filter)
      .populate('student', 'admissionNumber name')
      .sort({ createdAt: -1 })
      .select('-__v');

    res.json({
      success: true,
      count: transactions.length,
      school: req.school.name,
      data: transactions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Create transaction (e.g., from M-Pesa callback)
 */
exports.createTransaction = async (req, res) => {
  try {
    const { transactionId, reference, amount, source } = req.body;

    // Check for duplicate transaction in THIS school
    const existingTransaction = await Transaction.findOne({
      school: req.school._id,
      transactionId
    });

    if (existingTransaction) {
      return res.status(400).json({
        success: false,
        message: 'Transaction already processed'
      });
    }

    // Find student by admission number in THIS school
    let student = null;
    if (reference) {
      student = await Student.findOne({
        school: req.school._id,
        admissionNumber: reference.toUpperCase()
      });
    }

    // Create transaction with school reference
    const transaction = await Transaction.create({
      ...req.body,
      school: req.school._id,
      student: student?._id || null
    });

    // Update student balance if student found
    if (student) {
      student.currentBalance -= amount;
      await student.save();
    }

    res.status(201).json({
      success: true,
      message: 'Transaction recorded successfully',
      data: transaction,
      studentFound: !!student
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get transaction statistics for school
 */
exports.getTransactionStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    // Add school scope
    const filter = addSchoolFilter(req, dateFilter);

    const stats = await Transaction.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$status',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    const sourceStats = await Transaction.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$source',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      school: req.school.name,
      data: {
        byStatus: stats,
        bySource: sourceStats
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ============================================
// DASHBOARD CONTROLLER EXAMPLES
// ============================================

/**
 * Get dashboard statistics for school
 */
exports.getDashboardStats = async (req, res) => {
  try {
    const schoolFilter = { school: req.school._id };

    // Parallel queries for efficiency
    const [
      totalStudents,
      activeStudents,
      totalTransactions,
      recentTransactions,
      totalFees
    ] = await Promise.all([
      Student.countDocuments(schoolFilter),
      Student.countDocuments({ ...schoolFilter, status: 'Active' }),
      Transaction.countDocuments(schoolFilter),
      Transaction.find(schoolFilter)
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('student', 'admissionNumber name'),
      Fee.countDocuments({ ...schoolFilter, isActive: true })
    ]);

    // Calculate total revenue
    const revenueResult = await Transaction.aggregate([
      { $match: { ...schoolFilter, status: 'COMPLETED', type: 'CREDIT' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalRevenue = revenueResult[0]?.total || 0;

    // Calculate pending balance
    const balanceResult = await Student.aggregate([
      { $match: schoolFilter },
      { $group: { _id: null, total: { $sum: '$currentBalance' } } }
    ]);
    const pendingBalance = balanceResult[0]?.total || 0;

    res.json({
      success: true,
      school: {
        id: req.school._id,
        name: req.school.name,
        code: req.school.code
      },
      data: {
        students: {
          total: totalStudents,
          active: activeStudents
        },
        transactions: {
          total: totalTransactions,
          recent: recentTransactions
        },
        fees: {
          active: totalFees
        },
        financial: {
          totalRevenue,
          pendingBalance
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ============================================
// SUPER ADMIN SPECIFIC EXAMPLES
// ============================================

/**
 * Get all schools (super admin only)
 */
exports.getAllSchools = async (req, res) => {
  try {
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Super admin only.'
      });
    }

    const schools = await School.find()
      .select('-__v')
      .sort({ name: 1 });

    res.json({
      success: true,
      count: schools.length,
      data: schools
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get statistics across all schools (super admin only)
 */
exports.getPlatformStats = async (req, res) => {
  try {
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Super admin only.'
      });
    }

    const [
      totalSchools,
      activeSchools,
      totalStudents,
      totalRevenue
    ] = await Promise.all([
      School.countDocuments(),
      School.countDocuments({ isActive: true }),
      Student.countDocuments({ status: 'Active' }),
      Transaction.aggregate([
        { $match: { status: 'COMPLETED', type: 'CREDIT' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
    ]);

    res.json({
      success: true,
      data: {
        schools: {
          total: totalSchools,
          active: activeSchools
        },
        students: {
          total: totalStudents
        },
        revenue: {
          total: totalRevenue[0]?.total || 0
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = exports;
