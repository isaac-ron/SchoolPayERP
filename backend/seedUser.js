const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// User Schema (inline for simplicity)
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'bursar', 'teacher'], default: 'bursar' },
  school: { type: mongoose.Schema.Types.ObjectId, ref: 'School' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

// Seed function
const seedDefaultUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/schoolpay');
    console.log('MongoDB Connected...');

    // Check if user already exists
    const existingUser = await User.findOne({ email: 'admin@schoolpay.com' });
    if (existingUser) {
      console.log('Default user already exists!');
      console.log('Email: admin@schoolpay.com');
      console.log('Password: Admin@123');
      process.exit(0);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Admin@123', salt);

    // Create default user
    const user = await User.create({
      name: 'System Administrator',
      email: 'admin@schoolpay.com',
      password: hashedPassword,
      role: 'admin',
      isActive: true
    });

    console.log('✅ Default user created successfully!');
    console.log('=====================================');
    console.log('Email: admin@schoolpay.com');
    console.log('Password: Admin@123');
    console.log('=====================================');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

seedDefaultUser();
