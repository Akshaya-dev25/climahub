const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health / Info Route
app.get('/', (req, res) => {
  res.json({
    name: 'ClimaHub API',
    description: 'Centralized climate dataset platform for universities',
    version: '1.0.0',
    status: 'Running',
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        me: 'GET /api/auth/me (Protected)',
      },
      datasets: {
        list: 'GET /api/datasets?search=',
        upload: 'POST /api/datasets (Protected, Multipart)',
        getById: 'GET /api/datasets/:id',
        stats: 'GET /api/datasets/:id/stats',
        getComments: 'GET /api/datasets/:id/comments',
        addComment: 'POST /api/datasets/:id/comments (Protected)',
      },
    },
  });
});

// Mount Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/datasets', require('./routes/datasetRoutes'));

// Error handling middlewares
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`[ClimaHub Server] running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  console.log(`[ClimaHub API URL] http://localhost:${PORT}`);
});
