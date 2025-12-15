const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const http = require("http");
const {Server} = require("socket.io");
require("dotenv").config();

const app = express();
const Server = http.createServer(app);

//Middleware

app.use(cors);
app.use(express.json());
app.use(express.urlencoded({extended: true}));

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Socket.io Setup (Foundation for Phase 2)
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

// Basic Route for Testing
app.get('/', (req, res) => {
  res.send('SchoolPay Enterprise API is running...');
});

// Import Routes (To be created in next steps)
// const authRoutes = require('./routes/authRoutes');
// app.use('/api/auth', authRoutes);

// Start Server
const PORT = process.env.PORT || 5000;

// Connect to DB then listen
connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });
});
