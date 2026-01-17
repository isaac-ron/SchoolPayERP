const mongoose = require('mongoose');

const feeSchema = new mongoose.Schema({
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: [true, 'School reference is required'],
    index: true
  },
  name: {
    type: String,
    required: [true, 'Fee name is required'],
    trim: true
  },
  amount: {
    type: Number,
    required: [true, 'Fee amount is required'],
    min: [0, 'Fee amount cannot be negative']
  },
  type: {
    type: String,
    enum: ['TUITION', 'BOARDING', 'TRANSPORT', 'UNIFORM', 'BOOKS', 'EXAMINATION', 'OTHER'],
    required: [true, 'Fee type is required']
  },
  term: {
    type: String,
    enum: ['TERM_1', 'TERM_2', 'TERM_3', 'ANNUAL'],
    required: [true, 'Term is required']
  },
  academicYear: {
    type: String,
    required: [true, 'Academic year is required'],
    validate: {
      validator: function(v) {
        return /^\d{4}$/.test(v);
      },
      message: props => `${props.value} is not a valid year! Use format YYYY`
    }
  },
  classLevel: {
    type: String,
    enum: ['Grade 10', 'Grade 11', 'Grade 12', 'ALL'],
    default: 'ALL'
  },
  description: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  dueDate: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes for efficient queries by school
feeSchema.index({ school: 1, academicYear: 1, term: 1 });
feeSchema.index({ school: 1, isActive: 1 });
feeSchema.index({ school: 1, classLevel: 1 });

module.exports = mongoose.model('Fee', feeSchema);