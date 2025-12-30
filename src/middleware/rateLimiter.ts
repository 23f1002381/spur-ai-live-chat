import rateLimit from 'express-rate-limit';

// More lenient limits for development
const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10); // 15 minutes default
const maxRequests = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '1000', 10); // Increased to 1000 for development

export const rateLimiter = rateLimit({
  windowMs,
  max: maxRequests,
  message: {
    status: 'error',
    message: 'Too many requests from this IP, please try again later.',
    statusCode: 429,
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting in development for easier testing
    return process.env.NODE_ENV === 'development';
  },
});



