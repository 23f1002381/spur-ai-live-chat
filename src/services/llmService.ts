import OpenAI from 'openai';
import { AppError } from '../utils/AppError';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is not set in environment variables');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const MAX_TOKENS = parseInt(process.env.MAX_TOKENS || '500', 10);

const SYSTEM_PROMPT = `You are a helpful and friendly customer support agent for a small e-commerce store. 
Your role is to assist customers with their questions and concerns in a clear, concise, and professional manner.

Store Information:
- Shipping: We offer free shipping on orders over $50. Standard shipping (5-7 business days) costs $5.99. Express shipping (2-3 business days) costs $12.99.
- Returns: We accept returns within 30 days of purchase. Items must be unworn, unwashed, and in original packaging. Refunds are processed within 5-7 business days.
- Support Hours: Our support team is available Monday-Friday, 9 AM - 6 PM EST.
- Payment: We accept all major credit cards, PayPal, and Apple Pay.
- International Shipping: We currently ship to USA, Canada, UK, and Australia. International shipping costs vary by location.

Always be polite, helpful, and try to resolve customer issues. If you don't know something, admit it and offer to connect them with a human agent.`;

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export const generateReply = async (
  conversationHistory: ChatMessage[],
  userMessage: string
): Promise<string> => {
  try {
    const messages: ChatMessage[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...conversationHistory,
      { role: 'user', content: userMessage },
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: messages as any,
      max_tokens: MAX_TOKENS,
      temperature: 0.7,
    });

    const reply = completion.choices[0]?.message?.content;

    if (!reply) {
      throw new AppError('Failed to generate reply from AI', 500);
    }

    return reply.trim();
  } catch (error: any) {
    console.error('OpenAI API Error:', error);

    if (error instanceof AppError) {
      throw error;
    }

    // Handle specific OpenAI errors
    if (error.status === 401) {
      throw new AppError('Invalid API key. Please check your OpenAI API configuration.', 500);
    }

    if (error.status === 429) {
      throw new AppError('Rate limit exceeded. Please try again in a moment.', 429);
    }

    if (error.status === 503) {
      throw new AppError('AI service is temporarily unavailable. Please try again later.', 503);
    }

    // Generic error
    throw new AppError(
      'Failed to generate AI response. Please try again later.',
      500
    );
  }
};



