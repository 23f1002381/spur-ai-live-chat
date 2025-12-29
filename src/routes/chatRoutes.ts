import { Router } from 'express';
import { sendMessage, getConversation } from '../controllers/chatController';
import { validateChatMessage, handleValidationErrors } from '../middleware/validation';

const router = Router();

router.post(
  '/message',
  validateChatMessage,
  handleValidationErrors,
  sendMessage
);

router.get('/conversation/:sessionId', getConversation);

export default router;



