const Transaction = require('../models/Transaction');
const Student = require('../models/Student');

/**
 * @desc    Handle MPESA Validation (Safaricom asks: "Should I process this?")
 * @route   POST /api/mpesa/validation
 * @access  Public (Safaricom Only)
 */
const mpesaValidation = async (req, res) => {
  // Enterprise Rule: ALWAYS accept money. Logic checks happen in Confirmation.
  // We just return code 0 to tell Safaricom "Go ahead".
  console.log('\n========== MPESA VALIDATION RECEIVED ==========');
  console.log('Timestamp:', new Date().toISOString());
  console.log('Request Body:', JSON.stringify(req.body, null, 2));
  console.log('Response: Accepting validation');
  console.log('===============================================\n');
  
  res.json({
    ResultCode: 0,
    ResultDesc: "Accepted"
  });
};

/**
 * @desc    Handle MPESA Confirmation (Actual Payment Data)
 * @route   POST /api/mpesa/confirmation
 * @access  Public (Safaricom Only)
 */
const mpesaConfirmation = async (req, res) => {
  console.log('\n========== MPESA CONFIRMATION RECEIVED ==========');
  console.log('Timestamp:', new Date().toISOString());
  console.log('Request Body:', JSON.stringify(req.body, null, 2));
  
  try {
    console.log('[STEP 1] Extracting fields from Daraja API payload...');
    // 1. Extract fields from Daraja API C2B callback
    const {
      TransactionType,
      TransID,
      TransTime,
      TransAmount,
      BusinessShortCode,
      BillRefNumber,
      InvoiceNumber,
      OrgAccountBalance,
      ThirdPartyTransID,
      MSISDN,           // Note: This is MASKED (e.g., "2547 ***** 126")
      FirstName,
      MiddleName,
      LastName
    } = req.body;
    
    console.log('[STEP 1] Extracted fields:', {
      TransactionType,
      TransID,
      TransAmount,
      BillRefNumber,
      MSISDN,
      FullName: [FirstName, MiddleName, LastName].filter(Boolean).join(' ')
    });

    // Validate required fields
    if (!TransID || !TransAmount || !BillRefNumber) {
      console.error('❌ [ERROR] Missing required fields:', { TransID, TransAmount, BillRefNumber });
      return res.json({ ResultCode: 1, ResultDesc: "Missing required fields" });
    }
    console.log('✅ [STEP 1] Field validation passed');

    // 2. IDEMPOTENCY CHECK (Enterprise Critical)
    // Safaricom retries requests. Check if we already processed this TransID.
    console.log('[STEP 2] Checking for duplicate transactions...');
    const exists = await Transaction.findOne({ transactionId: TransID });
    if (exists) {
      console.log(`⚠️  [STEP 2] Duplicate transaction ${TransID} detected - ignoring`);
      return res.json({ ResultCode: 0, ResultDesc: "Duplicate" });
    }
    console.log('✅ [STEP 2] No duplicate found - proceeding');

    // 3. Find the Student
    // We clean the input (trim spaces, uppercase) to ensure matches
    console.log('[STEP 3] Looking up student...');
    const cleanAdmNo = BillRefNumber.trim().toUpperCase();
    console.log(`[STEP 3] Cleaned admission number: ${cleanAdmNo}`);
    
    // Note: For M-PESA callbacks, we need to search across all schools
    // The BusinessShortCode (paybill) will help identify the school
    const student = await Student.findOne({ admissionNumber: cleanAdmNo }).populate('school');
    
    if (student) {
      console.log('✅ [STEP 3] Student found:', {
        id: student._id,
        name: student.name,
        admissionNumber: student.admissionNumber,
        school: student.school?.name,
        currentBalance: student.currentBalance
      });
    } else {
      console.log('⚠️  [STEP 3] Student NOT found - will create suspense transaction');
    }

    // 4. Create the Transaction Record
    console.log('[STEP 4] Creating transaction record...');
    // Build full name from FirstName, MiddleName, LastName
    const fullName = [FirstName, MiddleName, LastName].filter(Boolean).join(' ') || 'Unknown';
    
    // Handle MSISDN - Safaricom masks it for privacy (e.g., "2547 ***** 126")
    // Check if phone number contains asterisks (masked)
    const isMasked = MSISDN && MSISDN.includes('*');
    let validPhone = null;
    
    if (!isMasked && MSISDN) {
      // Only process if not masked
      const cleanPhone = MSISDN.replace(/[\s*]/g, '');
      // Valid Kenyan number: 254XXXXXXXXX (12 digits total)
      if (cleanPhone.startsWith('254') && cleanPhone.length === 12) {
        validPhone = cleanPhone;
      }
    }
    
    console.log('[STEP 4] Phone processing:', {
      original: MSISDN,
      isMasked,
      validPhone: validPhone || 'null (masked or invalid)'
    });
    
    console.log('[STEP 4] Transaction data:', {
      school: student ? student.school._id : null,
      transactionId: TransID,
      student: student ? student._id : null,
      amount: parseFloat(TransAmount),
      source: 'MPESA',
      reference: cleanAdmNo,
      status: student ? 'COMPLETED' : 'PENDING',
      paidBy: fullName,
      phoneNumber: validPhone
    });
    
    const newTransaction = await Transaction.create({
      school: student ? student.school._id : null, // Add school if student found
      transactionId: TransID,
      student: student ? student._id : null, // Link if student exists, else null
      amount: parseFloat(TransAmount),
      source: 'MPESA',
      reference: cleanAdmNo, // What the parent typed
      status: student ? 'COMPLETED' : 'PENDING', // Pending if student unknown
      paidBy: fullName,
      phoneNumber: validPhone, // May be null if masked
      metadata: req.body // Save full payload for audit
    });
    
    console.log(`✅ [STEP 4] Transaction created successfully!`);
    console.log(`   ID: ${newTransaction._id}`);
    console.log(`   Status: ${newTransaction.status}`);

    // 5. Update Student Balance (If student exists)
    if (student) {
      console.log('[STEP 5] Updating student balance...');
      const oldBalance = student.currentBalance;
      // Decrease balance (Payment In)
      student.currentBalance -= parseFloat(TransAmount);
      await student.save();

      console.log('✅ [STEP 5] Balance updated for', student.name);
      console.log(`   Old Balance: KES ${oldBalance}`);
      console.log(`   Payment: KES ${TransAmount}`);
      console.log(`   New Balance: KES ${student.currentBalance}`);

      // 6. REAL-TIME SOCKET EMIT
      // This makes the Dashboard update instantly
      console.log('[STEP 6] Emitting socket event...');
      const io = req.app.get('io');
      if (io) {
        io.emit('payment_received', {
          id: newTransaction._id,
          studentName: student.name,
          admissionNumber: student.admissionNumber,
          amount: newTransaction.amount,
          source: 'MPESA',
          time: new Date().toLocaleTimeString(),
          status: 'COMPLETED'
        });
        console.log('✅ [STEP 6] Socket event emitted: payment_received');
      } else {
        console.log('⚠️  [STEP 6] Socket.io not available');
      }

      // 7. Send SMS Receipt (Async - don't await/block response)
      console.log('[STEP 7] Preparing SMS receipt...');
      const message = `Dear Parent, received KES ${TransAmount} for ${student.name}. New Balance: KES ${student.currentBalance}. Ref: ${TransID}.`;
      // sendSms(MSISDN, message); // Uncomment when SMS service is ready
      console.log('📱 [STEP 7] SMS (would be sent):', message);

    } else {
      // SUSPENSE ACCOUNT LOGIC
      console.log('[SUSPENSE] Student not found - transaction in suspense account');
      console.warn(`⚠️  Payment received for unknown Admission No: ${cleanAdmNo}`);
      console.log(`💰 Transaction ${TransID} created as PENDING (Suspense)`);
      
      console.log('[SUSPENSE] Emitting unknown_payment socket event...');
      const io = req.app.get('io');
      if (io) {
        io.emit('unknown_payment', {
          id: newTransaction._id,
          reference: cleanAdmNo,
          amount: newTransaction.amount,
          source: 'MPESA',
          time: new Date().toLocaleTimeString()
        });
        console.log('✅ [SUSPENSE] Socket event emitted: unknown_payment');
      }
    }

    // 8. Always respond to Safaricom
    console.log('\n✅ ========== SUCCESS ==========');
    console.log('Transaction processed successfully');
    console.log('TransactionID:', TransID);
    console.log('Amount: KES', TransAmount);
    console.log('Status:', student ? 'COMPLETED' : 'PENDING (Suspense)');
    console.log('================================\n');
    
    res.json({ ResultCode: 0, ResultDesc: "Processed" });

  } catch (error) {
    console.error('\n❌ ========== ERROR ==========');
    console.error('MPESA Confirmation Error:', error.message);
    console.error('Stack trace:', error.stack);
    console.error('Request body:', JSON.stringify(req.body, null, 2));
    console.error('==============================\n');
    
    // Even on error, respond OK to Safaricom to stop them from retrying endlessly
    res.json({ ResultCode: 0, ResultDesc: "Error but received" });
  }
};

/**
 * @desc    Register URLs (Helper to set up the callback)
 * @route   POST /api/mpesa/register
 * @access  Private (Admin Only)
 */
const mpesaRegisterUrl = async (req, res) => {
    // You can move the Axios/Auth logic here later to make it a one-click button
    // on your admin dashboard instead of using Postman.
    res.send("Endpoint reserved for auto-registration logic.");
};
// @desc    Record bank payment
// @route   POST /api/payments/bank
// @access  Private
const recordBankPayment = async (req, res) => {
  console.log('\n========== BANK PAYMENT RECORDING ==========');
  console.log('Timestamp:', new Date().toISOString());
  console.log('School:', req.school?.name);
  console.log('User:', req.user?.email);
  console.log('Request Body:', JSON.stringify(req.body, null, 2));
  
  try {
    const { transactionId, amount, reference, source, paidBy } = req.body;
    
    console.log('[STEP 1] Checking for duplicate transaction...');
    // Check if transaction already exists in THIS school
    const existingTransaction = await Transaction.findOne({ 
      school: req.school._id,
      transactionId 
    });
    if (existingTransaction) {
      console.log('❌ Duplicate transaction found:', transactionId);
      return res.status(400).json({ 
        success: false, 
        message: 'Transaction already recorded' 
      });
    }
    console.log('✅ [STEP 1] No duplicate found');
    
    console.log('[STEP 2] Looking up student...');
    // Find student by admission number in THIS school
    const student = await Student.findOne({ 
      school: req.school._id,
      admissionNumber: reference.toUpperCase() 
    });
    
    if (!student) {
      console.log('❌ Student not found:', reference);
      return res.status(404).json({ 
        success: false, 
        message: 'Student not found with this admission number' 
      });
    }
    console.log('✅ [STEP 2] Student found:', student.name);
    
    console.log('[STEP 3] Creating transaction record...');
    const transaction = await Transaction.create({
      school: req.school._id,
      transactionId,
      amount,
      source: source || 'BANK_TRANSFER',
      reference,
      type: 'CREDIT',
      status: 'COMPLETED',
      student: student._id,
      paidBy: paidBy || 'Bank Transfer',
      metadata: { ...req.body, recordedBy: req.user._id }
    });
    console.log('✅ [STEP 3] Transaction created:', transaction._id);
    
    console.log('[STEP 4] Updating student balance...');
    const oldBalance = student.currentBalance;
    // Update student balance
    student.currentBalance -= amount;
    await student.save();
    console.log('✅ [STEP 4] Balance updated');
    console.log(`   Old Balance: KES ${oldBalance}`);
    console.log(`   Payment: KES ${amount}`);
    console.log(`   New Balance: KES ${student.currentBalance}`);
    
    const populatedTransaction = await Transaction.findById(transaction._id)
      .populate('student', 'admissionNumber name classLevel');
    
    console.log('✅ ========== BANK PAYMENT SUCCESS ==========\n');
    res.status(201).json({ 
      success: true, 
      message: 'Bank payment recorded successfully',
      data: populatedTransaction 
    });
  } catch (error) {
    console.error('❌ ========== BANK PAYMENT ERROR ==========');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    console.error('==========================================\n');
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Record cash payment
// @route   POST /api/payments/cash
// @access  Private
const recordCashPayment = async (req, res) => {
  console.log('\n========== CASH PAYMENT RECORDING ==========');
  console.log('Timestamp:', new Date().toISOString());
  console.log('School:', req.school?.name);
  console.log('User:', req.user?.email);
  console.log('Request Body:', JSON.stringify(req.body, null, 2));
  
  try {
    const { amount, reference, receiptNumber, paidBy } = req.body;
    
    console.log('[STEP 1] Looking up student...');
    // Find student in THIS school
    const student = await Student.findOne({ 
      school: req.school._id,
      admissionNumber: reference.toUpperCase() 
    });
    
    if (!student) {
      console.log('❌ Student not found:', reference);
      return res.status(404).json({ 
        success: false, 
        message: 'Student not found' 
      });
    }
    console.log('✅ [STEP 1] Student found:', student.name);
    
    console.log('[STEP 2] Creating transaction record...');
    const transactionId = receiptNumber || `CASH-${Date.now()}`;
    const transaction = await Transaction.create({
      school: req.school._id,
      transactionId,
      amount,
      source: 'CASH',
      reference,
      type: 'CREDIT',
      status: 'COMPLETED',
      student: student._id,
      paidBy: paidBy || reference,
      metadata: { recordedBy: req.user._id, recordedAt: new Date() }
    });
    console.log('✅ [STEP 2] Transaction created:', transaction._id);
    
    console.log('[STEP 3] Updating student balance...');
    const oldBalance = student.currentBalance;
    student.currentBalance -= amount;
    await student.save();
    console.log('✅ [STEP 3] Balance updated');
    console.log(`   Old Balance: KES ${oldBalance}`);
    console.log(`   Payment: KES ${amount}`);
    console.log(`   New Balance: KES ${student.currentBalance}`);
    
    const populatedTransaction = await Transaction.findById(transaction._id)
      .populate('student', 'admissionNumber name classLevel');
    
    console.log('✅ ========== CASH PAYMENT SUCCESS ==========\n');
    res.status(201).json({ 
      success: true, 
      data: populatedTransaction 
    });
  } catch (error) {
    console.error('❌ ========== CASH PAYMENT ERROR ==========');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    console.error('==========================================\n');
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get payment statistics
// @route   GET /api/payments/stats
// @access  Private
const getPaymentStats = async (req, res) => {
  console.log('\n========== PAYMENT STATS REQUEST ==========');
  console.log('Timestamp:', new Date().toISOString());
  console.log('School:', req.school?.name);
  console.log('Query Params:', req.query);
  
  try {
    const { startDate, endDate } = req.query;
    
    let dateFilter = {
      school: req.school._id
    };
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }
    console.log('[STEP 1] Date filter:', dateFilter);
    
    console.log('[STEP 2] Calculating stats by source...');
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
    
    console.log('[STEP 3] Calculating total revenue...');
    const totalRevenue = await Transaction.aggregate([
      { $match: { ...dateFilter, type: 'CREDIT', status: 'COMPLETED' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    const responseData = {
      success: true,
      school: req.school.name,
      data: {
        bySource: stats,
        totalRevenue: totalRevenue[0]?.total || 0,
        period: {
          startDate: req.query.startDate,
          endDate: req.query.endDate
        }
      }
    };
    
    console.log('✅ Stats calculated:');
    console.log('   Total Revenue: KES', responseData.data.totalRevenue);
    console.log('   By Source:', stats);
    console.log('==========================================\n');
    
    res.status(200).json(responseData);
  } catch (error) {
    console.error('❌ ========== STATS ERROR ==========');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    console.error('====================================\n');
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  mpesaValidation,
  mpesaConfirmation,
  mpesaRegisterUrl,
  recordBankPayment,
  recordCashPayment,
  getPaymentStats
};
