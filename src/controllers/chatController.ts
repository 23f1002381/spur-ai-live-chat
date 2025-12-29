import { Request, Response } from 'express';
import { processChatMessage } from '../services/chatService';
import { catchAsync } from '../utils/catchAsync';

export const sendMessage = catchAsync(async (req: Request, res: Response) => {
  const { message, sessionId } = req.body;

  const result = await processChatMessage(message, sessionId);

  res.status(200).json({
    status: 'success',
    data: result,
  });
});

export const getConversation = catchAsync(async (req: Request, res: Response) => {
  const { sessionId } = req.params;
  const { prisma } = await import('../utils/prisma');
  
  // Verify conversation exists
  const conversation = await prisma.conversation.findUnique({
    where: { id: sessionId },
    include: {
      messages: {
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  if (!conversation) {
    return res.status(404).json({
      status: 'error',
      message: 'Conversation not found',
      statusCode: 404,
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      sessionId: conversation.id,
      messages: conversation.messages.map((msg) => ({
        sender: msg.sender,
        text: msg.text,
        timestamp: msg.createdAt,
      })),
    },
  });
});

