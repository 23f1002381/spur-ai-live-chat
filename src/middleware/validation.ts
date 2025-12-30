import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';

const MAX_MESSAGE_LENGTH = parseInt(process.env.MAX_MESSAGE_LENGTH || '2000', 10);

export const validateChatMessage = [
  body('message')
    .trim()
    .notEmpty()
    .withMessage('Message cannot be empty')
    .isLength({ max: MAX_MESSAGE_LENGTH })
    .withMessage(`Message cannot exceed ${MAX_MESSAGE_LENGTH} characters`),
  body('sessionId')
    .optional()
    .custom((value) => {
      if (value === null || value === undefined || value === '') {
        return true; // Allow null, undefined, or empty string
      }
      return typeof value === 'string';
    })
    .withMessage('Session ID must be a string'),
];

export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((err) => err.msg).join(', ');
    throw new AppError(errorMessages, 400);
  }
  next();
};



