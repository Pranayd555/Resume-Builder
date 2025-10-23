const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss');
const passport = require('passport');
require('dotenv').config();


const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const resumeRoutes = require('./routes/resumes');
const templateRoutes = require('./routes/templates');
const subscriptionRoutes = require('./routes/subscriptions');
const uploadRoutes = require('./routes/uploads');
const emailTestRoutes = require('./routes/email-test');
const feedbackRoutes = require('./routes/feedback');
const contactRoutes = require('./routes/contact');
const analyticsRoutes = require('./routes/analytics');
const aiRoutes = require('./routes/ai');
const createTemplateRoutes = require('./routes/createTemplate');
const paymentRoutes = require('./routes/payment');

const errorHandler = require('./middleware/errorHandler');
const logger = require('./utils/logger');

// Import passport configuration
require('./config/passport');

const app = express();

// Trust proxy for deployment
app.set('trust proxy', 1);

// Set server timeout for long-running requests (like AI model initialization)
app.use((req, res, next) => {
  // Set timeout to 5 minutes for AI-related endpoints
  if (req.path.includes('/parse-resume') || req.path.includes('/ai/')) {
    req.setTimeout(300000); // 5 minutes
    res.setTimeout(300000); // 5 minutes
  } else {
    req.setTimeout(30000); // 30 seconds for other requests
    res.setTimeout(30000); // 30 seconds for other requests
  }
  next();
});

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https:"],
      scriptSrc: ["'self'", "https:"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https:"],
      fontSrc: ["'self'", "https:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'", "https:"],
      frameSrc: ["'none'"],
    },
  },
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'development' ? 1000 : 100, // Higher limit for development
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to most API routes, but exclude OAuth routes
app.use('/api/', (req, res, next) => {
  // Skip rate limiting for OAuth routes
  if (req.path.startsWith('/auth/google') || req.path.startsWith('/auth/linkedin')) {
    return next();
  }
  return limiter(req, res, next);
});

// CORS configuration for mobile and web
const corsOptions = {
  origin: function (origin, callback) {
    // Allow mobile apps and development
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'https://resume-builder-pranayd555-pranay-das-projects.vercel.app',
      'https://resume-builder-pranay-das-projects.vercel.app',
      'https://resume-builder-dev-pranay-das.vercel.app',
      'capacitor://localhost',
      'ionic://localhost',
      'http://localhost',
      'https://localhost'
    ];
    
    // Allow mobile apps (no origin) and allowed origins
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
};

app.use(cors(corsOptions));

// Compression middleware
app.use(compression());

// Logging
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Initialize passport
app.use(passport.initialize());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use((req, res, next) => {
  if (req.body) {
    // Recursive function to sanitize nested objects and arrays
    const sanitizeObject = (obj, isResumeRequest = false) => {
      if (typeof obj === 'string') {
        // Check if this is a resume content field
        const resumeContentFields = ['summary', 'description', 'content'];
        const isResumeContentField = isResumeRequest && resumeContentFields.some(field => 
          obj.includes(`<span style=`) || obj.includes(`<strong>`) || obj.includes(`<em>`) || obj.includes(`<u>`)
        );
        
        if (isResumeContentField) {
          // For resume content fields, use a more permissive XSS filter that preserves CKEditor formatting
          return xss(obj, {
            whiteList: {
              'p': ['style'],
              'span': ['style'],
              'strong': [],
              'b': [],
              'em': [],
              'i': [],
              'u': [],
              'ol': ['class', 'style'],
              'ul': ['class', 'style'],
              'li': ['class', 'data-list-item-id', 'style'],
              'br': [],
              'div': ['style'],
              'h1': ['style'],
              'h2': ['style'],
              'h3': ['style'],
              'h4': ['style'],
              'h5': ['style'],
              'h6': ['style'],
              'section': ['style'],
              'article': ['style'],
              'header': ['style'],
              'footer': ['style'],
              'main': ['style'],
              'aside': ['style'],
              'nav': ['style'],
              'table': ['style'],
              'tr': ['style'],
              'td': ['style'],
              'th': ['style'],
              'tbody': ['style'],
              'thead': ['style'],
              'tfoot': ['style']
            },
            stripIgnoreTag: true,
            stripIgnoreTagBody: ['script']
          });
        } else {
          // For other fields, use standard XSS sanitization
          return xss(obj);
        }
      } else if (Array.isArray(obj)) {
        return obj.map(item => sanitizeObject(item, isResumeRequest));
      } else if (obj && typeof obj === 'object') {
        const sanitized = {};
        Object.keys(obj).forEach(key => {
          sanitized[key] = sanitizeObject(obj[key], isResumeRequest);
        });
        return sanitized;
      }
      return obj;
    };
    
    // Check if this is a resume or template creation request
    const isResumeRequest = req.path.includes('/resumes') || req.path.includes('/createTemplate');
    
    // Sanitize the entire request body
    req.body = sanitizeObject(req.body, isResumeRequest);
  }
  next();
});

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/resumebuilder', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => logger.info('Connected to MongoDB'))
.catch(err => logger.error('MongoDB connection error:', err));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Static file serving for thumbnails
app.use('/thumbnails', express.static('thumbnails', {
  maxAge: '7d', // Cache for 7 days
  etag: true,
  lastModified: true,
  setHeaders: (res, path) => {
    // Set appropriate headers for different image types
    if (path.endsWith('.webp')) {
      res.setHeader('Content-Type', 'image/webp');
    } else if (path.endsWith('.png')) {
      res.setHeader('Content-Type', 'image/png');
    } else if (path.endsWith('.jpg') || path.endsWith('.jpeg')) {
      res.setHeader('Content-Type', 'image/jpeg');
    }
  }
}));

// Static file serving for profile pictures
app.use('/uploads', express.static('uploads', {
  maxAge: '7d', // Cache for 7 days
  etag: true,
  lastModified: true,
  setHeaders: (res, path) => {
    // Set appropriate headers for different image types
    if (path.endsWith('.webp')) {
      res.setHeader('Content-Type', 'image/webp');
    } else if (path.endsWith('.png')) {
      res.setHeader('Content-Type', 'image/png');
    } else if (path.endsWith('.jpg') || path.endsWith('.jpeg')) {
      res.setHeader('Content-Type', 'image/jpeg');
    } else if (path.endsWith('.gif')) {
      res.setHeader('Content-Type', 'image/gif');
    }
  }
}));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/subscription', subscriptionRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/email-test', emailTestRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/createTemplate', createTemplateRoutes);
app.use('/api/payment', paymentRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Error handling middleware
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  try {
    await mongoose.connection.close();
    logger.info('MongoDB connection closed');
    process.exit(0);
  } catch (error) {
    logger.error('Error closing MongoDB connection:', error);
    process.exit(1);
  }
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  try {
    await mongoose.connection.close();
    logger.info('MongoDB connection closed');
    process.exit(0);
  } catch (error) {
    logger.error('Error closing MongoDB connection:', error);
    process.exit(1);
  }
});

const PORT = process.env.PORT || 5000;

// Only start the server if not in test mode
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  });
}

module.exports = app; 