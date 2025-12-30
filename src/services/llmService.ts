import Groq from 'groq-sdk';
import { AppError } from '../utils/AppError';

/**
 * Safer initialization: do NOT validate or throw on missing env vars at module import time.
 * - Prevents crashing the whole server when an LLM provider is misconfigured.
 * - Delay failures until a request actually needs the LLM (lazy failure).
 * This keeps `/health` and other endpoints working even when the AI key is absent.
 */
const getGroqClient = () => {
  // Support multiple env var names (GROQ_API_KEY is preferred)
  const apiKey =
    process.env.GROQ_API_KEY ||
    process.env.GROQ_API ||
    process.env.GROQ_API_TOKEN ||
    process.env.GROQ_KEY ||
    process.env.OPENAI_API_KEY ||
    '';

  // If no API key is set and we're running in development, return a lightweight mock
  // so the app remains usable locally without a real Groq key. In production we still
  // fail loudly so operators can fix configuration.
  if (!apiKey) {
    if ((process.env.NODE_ENV || 'development') === 'development') {
      // In dev, log a visible warning once and return a minimal mock
      console.warn('⚠️ GROQ API key not found. Using DEV mock responses. Set GROQ_API_KEY to enable real AI responses.');

      // Minimal mock compatible with the parts of the SDK we use in this app
      return {
        chat: {
          completions: {
            create: async ({ messages }: any) => {
              const userMessage = messages?.slice().reverse().find((m: any) => m.role === 'user')?.content || 'Hello';
              return {
                choices: [
                  { message: { content: `DEV-MOCK: I received your message: ${userMessage}` } },
                ],
              };
            },
          },
        },
      } as any;
    }

    return null;
  }

  return new Groq({ apiKey });
};

const MAX_TOKENS = parseInt(process.env.MAX_TOKENS || '500', 10);

const SYSTEM_PROMPT = `You are a helpful and friendly customer support agent for a small e-commerce store.\nAlways be polite, concise, and professional.`;

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export const generateReply = async (
  conversationHistory: ChatMessage[],
  userMessage: string
): Promise<string> => {
  // Lazy-check: fail only when the LLM is actually needed — don't fail at import-time.
  const groq = getGroqClient();
  if (!groq) {
    // 503 indicates the AI provider is unavailable due to misconfiguration.
    throw new AppError('AI provider misconfigured: GROQ_API_KEY is missing', 503);
  }

  try {
    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...conversationHistory,
      { role: 'user', content: userMessage },
    ];

    const completion = await groq.chat.completions.create({
      model: 'llama3-8b-8192',
      messages: messages as any,
      temperature: 0.7,
      max_tokens: MAX_TOKENS,
    });

    // Log raw completion only in development for debugging
    if ((process.env.NODE_ENV || 'development') === 'development') {
      console.log('========== RAW GROQ COMPLETION ==========', '\n');
      // Depth null to show full object during local debugging
      console.dir(completion, { depth: null });
      console.log('=========================================');
    }

    // Safely collect string values from nested objects (bounded traversal)
    const collectStrings = (obj: any, acc: string[], depth = 0) => {
      if (!obj || depth > 8 || acc.length > 50) return;
      if (typeof obj === 'string') {
        if (obj.trim().length > 0) acc.push(obj.trim());
        return;
      }
      if (Array.isArray(obj)) {
        for (const item of obj) collectStrings(item, acc, depth + 1);
        return;
      }
      if (typeof obj === 'object') {
        for (const key of Object.keys(obj)) {
          // Skip known large binary-like keys
          if (key === 'binary' || key === 'blob') continue;
          try {
            collectStrings((obj as any)[key], acc, depth + 1);
          } catch (e) {
            // ignore traversal errors
          }
        }
      }
    };

    // Try prioritized extraction then fall back to collecting any strings
    const extractReplyFromCompletion = (c: any): string | null => {
      if (!c) return null;

      // 1) Common OpenAI-like shapes
      const candidatePaths = [
        c?.choices?.[0]?.message?.content,
        c?.choices?.[0]?.delta?.content,
        c?.choices?.[0]?.text,
        c?.choices?.[0]?.content,
        c?.message?.content,
        c?.content,
        c?.output?.[0]?.content,
        c?.output?.[0]?.text,
      ];

      for (const item of candidatePaths) {
        if (typeof item === 'string' && item.trim().length > 0) return item.trim();
      }

      // 2) If streaming deltas were returned as an array or nested object, gather & concat
      const gathered: string[] = [];
      collectStrings(c, gathered);
      if (gathered.length > 0) {
        // Prefer longer aggregated text
        const joined = gathered.join(' ').replace(/\s+/g, ' ').trim();
        if (joined.length > 0) return joined;
      }

      return null;
    };

    const reply = extractReplyFromCompletion(completion);

    if (!reply || reply.trim().length === 0) {
      // Do not error out — return a friendly fallback message so the user still gets a helpful reply
      console.warn('Groq returned empty/unknown completion shape; returning fallback reply.');
      return "Sorry, I couldn't generate a response right now. Please try again in a moment.";
    }

    return reply.trim();
  } catch (error: any) {
    console.error('Groq API Error:', error);

    // Rate limit
    if (error?.status === 429) {
      throw new AppError(
        'AI service is temporarily busy. Please try again in a moment.',
        429
      );
    }

    // Authentication / misconfiguration detected by upstream (wrong/expired key)
    if (error?.response?.status === 401 || error?.response?.status === 403) {
      throw new AppError(
        'AI provider authentication failed. Please verify the API key/configuration.',
        503
      );
    }

    // Network / upstream errors (DNS, ECONNREFUSED, timeouts, etc.)
    const isNetworkError =
      error?.code === 'ENOTFOUND' ||
      error?.code === 'ECONNREFUSED' ||
      error?.name === 'FetchError' ||
      /network|timeout|ECONNREFUSED|ENOTFOUND/i.test(error?.message || '');

    if (isNetworkError) {
      throw new AppError(
        'Network error contacting AI service. Please try again later.',
        502
      );
    }

    // Fallback for other errors
    throw new AppError(
      'Failed to generate AI response. Please try again later.',
      500
    );
  }
};
