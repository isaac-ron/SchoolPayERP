const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    admissionNumber: {
        type: String,
        required: [true, 'Admission number is required'],
        unique: true,
        trim: true,
        uppercase: true,
        index: true
    },
    name:{
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    classLevel: {
        type: String,
        required: [true, 'Class level is required'],
        enum: ["Grade 10", "Grade 11", "Grade 12"]

    },
    stream: {
        type: String,
        trim: true
    },
    guardianName: {
    type: String,
    required: [true, 'Guardian name is required']
  },
  guardianPhone: {
    type: String,
    required: [true, 'Guardian phone number is required'],
    validate: {
      validator: function(v) {
        // Basic validation for Kenyan numbers (254...)
        return /^254\d{9}$/.test(v);
      },
      message: props => `${props.value} is not a valid Kenyan phone number! Use format 2547XXXXXXXX`
    }
  },
  currentBalance: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['Active', 'Suspended', 'Alumni', 'Transferred'],
    default: 'Active'
  }
}, {
  timestamps: true // Automatically adds createdAt and updatedAt
});

module.exports = mongoose.model('Student', studentSchema);
