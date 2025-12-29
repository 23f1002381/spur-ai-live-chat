import { prisma } from '../utils/prisma';
import { generateReply, ChatMessage } from './llmService';
import { AppError } from '../utils/AppError';

export interface SaveMessageParams {
  conversationId: string;
  sender: 'user' | 'ai';
  text: string;
}

export interface ChatResponse {
  reply: string;
  sessionId: string;
}

export const createConversation = async (): Promise<string> => {
  const conversation = await prisma.conversation.create({
    data: {},
  });
  return conversation.id;
};

export const getConversationHistory = async (
  conversationId: string
): Promise<ChatMessage[]> => {
  const messages = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: 'asc' },
  });

  return messages.map((msg) => ({
    role: msg.sender === 'user' ? 'user' : 'assistant',
    content: msg.text,
  }));
};

export const saveMessage = async ({
  conversationId,
  sender,
  text,
}: SaveMessageParams): Promise<void> => {
  await prisma.message.create({
    data: {
      conversationId,
      sender,
      text,
    },
  });
};

export const processChatMessage = async (
  message: string,
  sessionId?: string
): Promise<ChatResponse> => {
  try {
    // Get or create conversation
    let conversationId = sessionId || '';
    
    if (!conversationId) {
      conversationId = await createConversation();
    } else {
      // Verify conversation exists
      const exists = await prisma.conversation.findUnique({
        where: { id: conversationId },
      });
      
      if (!exists) {
        conversationId = await createConversation();
      }
    }

    // Save user message
    await saveMessage({
      conversationId,
      sender: 'user',
      text: message.trim(),
    });

    // Get conversation history
    const history = await getConversationHistory(conversationId);

    // Generate AI reply
    const reply = await generateReply(history, message.trim());

    // Save AI reply
    await saveMessage({
      conversationId,
      sender: 'ai',
      text: reply,
    });

    return {
      reply,
      sessionId: conversationId,
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Failed to process chat message', 500);
  }
};

