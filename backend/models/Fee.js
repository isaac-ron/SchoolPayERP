const mongoose = require('mongoose');

const feeSchema = new mongoose.Schema({
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

module.exports = mongoose.model('Fee', feeSchema);