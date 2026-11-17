const logger = require('../utils/logger');
const { errorMeta, requestMeta } = require('../utils/logSafe');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log route, method, user id, error name and field paths only. err.stack and
  // err.message can contain submitted values (Mongoose cast errors quote them).
  logger.error('Unhandled request error', { ...requestMeta(req), ...errorMeta(err) });

  // Mongoose bad ObjectId in the URL -> 404; a bad value in a body field -> 400
  if (err.name === 'CastError') {
    error = err.path === '_id'
      ? { message: 'Resource not found', statusCode: 404 }
      : { message: `Invalid value for ${err.path}`, statusCode: 400 };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = { message, statusCode: 400 };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message);
    error = { message, statusCode: 400 };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = { message, statusCode: 401 };
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = { message, statusCode: 401 };
  }

  // razorpay errors
  if (err.type === 'razorpayCardError') {
    const message = 'Payment failed';
    error = { message, statusCode: 402 };
  }

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    const message = 'File too large';
    error = { message, statusCode: 413 };
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler; 