import 'dotenv/config';   // 👈 MUST be first
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import chatRoutes from './routes/chatRoutes';
import { errorHandler } from './middleware/errorHandler';
import { rateLimiter } from './middleware/rateLimiter';


// Warn if GROQ key is missing in non-dev environments so issues are visible in logs
if (!process.env.GROQ_API_KEY && !process.env.GROQ_API && !process.env.GROQ_API_TOKEN && !process.env.GROQ_KEY) {
  if ((process.env.NODE_ENV || 'development') !== 'development') {
    console.warn('⚠️ GROQ API key not found. Set GROQ_API_KEY (or GROQ_API/GROQ_API_TOKEN/GROQ_KEY) for the AI provider to work in production.');
  }
}

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
app.use(rateLimiter);

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is running',
  });
});

// Routes
app.use('/api/chat', chatRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found',
    statusCode: 404,
  });
});

// Global error handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;



