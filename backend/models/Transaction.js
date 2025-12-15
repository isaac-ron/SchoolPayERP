const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    required: true,
    unique: true, // Ensures we don't process the same MPESA text twice
    trim: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: false // False initially, in case payment is to "Suspense" (unknown student)
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  source: {
    type: String,
    enum: ['MPESA', 'BANK_AGENT', 'BANK_TRANSFER', 'CASH', 'CHEQUE'],
    required: true
  },
  type: {
    type: String,
    enum: ['CREDIT', 'DEBIT'], // Credit = Payment in, Debit = Reversal/Charge
    default: 'CREDIT'
  },
  status: {
    type: String,
    enum: ['COMPLETED', 'PENDING', 'FAILED', 'REVERSED'],
    default: 'COMPLETED'
  },
  reference: {
    type: String, // The account number entered by the payer (e.g., ADM-001)
    required: true
  },
  metadata: {
    type: Object, // Stores the raw payload from Daraja/Bank API for audit trails
    default: {}
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Transaction', transactionSchema);