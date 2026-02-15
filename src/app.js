const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { db } = require('../src/config');
const { rateLimiter } = require('../src/middleware');
const mainRouter = require('../src/routes');
const authRouter = require('../src/routes/auth');
const fpoRouter = require('../src/routes/fpo');
const farmerRouter = require('../src/routes/farmer');
const simpleFarmerRouter = require('../src/routes/simple/farmerRoutes');
const { ResponseUtils } = require('../src/utils');

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:19006', 'http://localhost:8081', 'http://localhost:19000', 'http://192.168.0.7:3000', 'http://192.168.0.7:8081', 'http://3.110.114.250:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: true,
  optionsSuccessStatus: 204
}));

// Enable preflight for all routes
app.options('*', cors());

// Log all requests for debugging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} | ${req.method} ${req.originalUrl}`);
  next();
});

app.use(bodyParser.json());


// Initialize database
db.initializeDatabase()
  .then(() => {
    console.log('✅ Database initialized successfully');
    
    // API Routes
    app.use('/api', mainRouter);
    app.use('/api/auth', authRouter);
    app.use('/api/fpo', fpoRouter);
    app.use('/api/farmer', farmerRouter);
    app.use('/api', simpleFarmerRouter); // Direct farmer route without validations

    // 404 Handler
    app.use((req, res) => {
      ResponseUtils.notFound(res, 'Endpoint not found');
    });

    // Error Handler
    app.use((err, req, res, next) => {
      console.error('Unhandled error:', err);
      ResponseUtils.serverError(res, err);
    });

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`🚀 API ready at http://localhost:${PORT}`);
    });
  })
  .catch(error => {
    console.error('❌ Failed to initialize database:', error);
    process.exit(1);
  });

module.exports = app;