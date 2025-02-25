'use strict';

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const winston = require('./src/config/logger');
const bookRoutes = require('./src/routes/bookRoutes');

const app = express();

app.use(helmet());
app.use(cors()); 

app.use(compression());

app.use(morgan('combined', { stream: winston.stream }));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests, please try again later.',
});
app.use('/api/', apiLimiter);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/v1', bookRoutes);

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  winston.info(`Server running on port ${PORT}`);
});

process.on('SIGTERM', () => {
  winston.info('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    winston.info('Server closed.');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  winston.info('SIGINT received. Shutting down...');
  server.close(() => {
    winston.info('Server closed.');
    process.exit(0);
  });
});
