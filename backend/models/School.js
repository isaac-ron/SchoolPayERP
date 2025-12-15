const mongoose = require('mongoose');

const schoolSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'School name is required'],
    trim: true,
    unique: true
  },
  code: {
    type: String,
    required: [true, 'School code is required'],
    unique: true,
    uppercase: true,
    trim: true
  },
  paybillNumber: {
    type: String,
    required: [true, 'M-PESA Paybill number is required'],
    validate: {
      validator: function(v) {
        return /^\d{5,7}$/.test(v);
      },
      message: props => `${props.value} is not a valid paybill number!`
    }
  },
  accountNumber: {
    type: String,
    trim: true
  },
  contactEmail: {
    type: String,
    required: [true, 'Contact email is required'],
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  contactPhone: {
    type: String,
    required: [true, 'Contact phone is required'],
    validate: {
      validator: function(v) {
        return /^254\d{9}$/.test(v);
      },
      message: props => `${props.value} is not a valid Kenyan phone number! Use format 2547XXXXXXXX`
    }
  },
  address: {
    street: String,
    city: String,
    county: String,
    postalCode: String
  },
  bankDetails: {
    bankName: String,
    accountName: String,
    accountNumber: String,
    branch: String
  },
  logo: {
    type: String // URL to logo image
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('School', schoolSchema);