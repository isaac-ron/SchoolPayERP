const express = require("express");
const cors = require("cors");
const http = require("http");
const {Server} = require("socket.io");
const helmet = require("helmet");
const morgan = require("morgan");
require("dotenv").config();
const connectDB = require('./config/db');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');

const app = express();
const server = http.createServer(app);

// Security Middleware
app.use(helmet());

// Logging Middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Body Parser Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// Socket.io Setup
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:3000"], // React dev ports
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log(`New client connected: ${socket.id}`);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Make io accessible to routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Basic Route for Testing
app.get('/', (req, res) => {
  res.send('SchoolPay Enterprise API is running...');
});

// API Routes
const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const feeRoutes = require('./routes/feeRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const schoolRoutes = require('./routes/schoolRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/fees', feeRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/mobile', paymentRoutes); // M-PESA specific endpoints (validation, confirmation, register)
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/schools', schoolRoutes);

// Error Handling Middleware (must be last)
app.use(notFound);
app.use(errorHandler);

// Start Server
const PORT = process.env.PORT || 5000;

// Connect to DB then listen
connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
});
