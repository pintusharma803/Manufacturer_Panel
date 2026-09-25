const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { initializeDatabase } = require('./config/db');
const { seedDatabase } = require('./seed');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Routes
const authRoutes = require('./routes/authRoutes');
const customerRoutes = require('./routes/customerRoutes');
const deviceRoutes = require('./routes/deviceRoutes');
const statsRoutes = require('./routes/statsRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/devices', deviceRoutes);
app.use('/api/stats', statsRoutes);

// Health check & system info
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    system: 'PiezoPulse IoT Platform API',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

async function startServer() {
  try {
    await initializeDatabase();
    await seedDatabase();

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Health Check: http://localhost:${PORT}/api/health`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
  }
}

startServer();
