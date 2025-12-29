# Spur AI Live Chat Agent

A production-ready AI-powered live chat application built for customer support. This project demonstrates a full-stack implementation with a Node.js/TypeScript backend and a Svelte frontend, integrated with OpenAI's GPT-3.5-turbo for intelligent customer support responses.

## 🚀 Tech Stack

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: SQLite with Prisma ORM
- **LLM**: OpenAI GPT-3.5-turbo
- **Validation**: express-validator
- **Rate Limiting**: express-rate-limit

### Frontend
- **Framework**: Svelte 4
- **Build Tool**: Vite
- **Styling**: CSS with modern design system

## 📋 Features

- ✅ Real-time AI-powered chat interface
- ✅ Conversation persistence with SQLite
- ✅ Session management (conversations persist across page reloads)
- ✅ Robust error handling and validation
- ✅ Rate limiting for API protection
- ✅ Responsive, modern UI/UX
- ✅ Auto-scroll to latest messages
- ✅ Loading states and error feedback
- ✅ Pre-configured FAQ knowledge base

## 🛠️ Local Setup

### Prerequisites

- Node.js 18+ and npm
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))

### Step 1: Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd spur-ai-live-chat

# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### Step 2: Environment Configuration

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` and add your OpenAI API key:

```env
DATABASE_URL="file:./dev.db"
PORT=3000
NODE_ENV=development
OPENAI_API_KEY=your_openai_api_key_here
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
FRONTEND_URL=http://localhost:5173
MAX_MESSAGE_LENGTH=2000
MAX_TOKENS=500
```

Create a `.env` file in the `frontend` directory:

```bash
cd frontend
echo "VITE_API_URL=http://localhost:3000/api" > .env
cd ..
```

### Step 3: Database Setup

We use SQLite with Prisma ORM.

```bash
# Generate Prisma Client
npm run prisma:generate

# Run database migrations (creates dev.db)
npm run prisma:migrate
```

**Database Details:**
- Schema: `prisma/schema.prisma`
- Migrations: `prisma/migrations/`
- Database file: `prisma/dev.db` (created after first migration)

### Step 4: Run the Application

**Option A: Run both backend and frontend together**

```bash
npm run dev
```

**Option B: Run separately**

Terminal 1 (Backend):
```bash
npm run dev:backend
```

Terminal 2 (Frontend):
```bash
npm run dev:frontend
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

### Step 5: Build for Production

```bash
# Build both backend and frontend
npm run build

# Start production server
npm start
```

## 📁 Project Structure

```
spur-ai-live-chat/
├── src/
│   ├── controllers/       # Request handlers
│   │   └── chatController.ts
│   ├── middleware/        # Express middleware
│   │   ├── errorHandler.ts
│   │   ├── rateLimiter.ts
│   │   └── validation.ts
│   ├── routes/            # API routes
│   │   └── chatRoutes.ts
│   ├── services/          # Business logic
│   │   ├── chatService.ts
│   │   └── llmService.ts
│   ├── utils/             # Utilities
│   │   ├── AppError.ts
│   │   ├── catchAsync.ts
│   │   └── prisma.ts
│   └── server.ts          # Express app entry point
├── prisma/
│   └── schema.prisma      # Database schema
├── frontend/
│   ├── src/
│   │   ├── components/    # Svelte components
│   │   │   ├── ChatWidget.svelte
│   │   │   ├── ChatMessage.svelte
│   │   │   └── ChatInput.svelte
│   │   ├── App.svelte
│   │   └── main.js
│   └── vite.config.js
└── package.json
```

## 🔌 API Documentation

### POST `/api/chat/message`

Send a message to the AI agent.

**Request Body:**
```json
{
  "message": "What's your return policy?",
  "sessionId": "optional-conversation-id"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "reply": "We accept returns within 30 days...",
    "sessionId": "uuid-conversation-id"
  }
}
```

### GET `/api/chat/conversation/:sessionId`

Retrieve conversation history.

**Response:**
```json
{
  "status": "success",
  "data": {
    "sessionId": "uuid",
    "messages": [
      {
        "sender": "user",
        "text": "Hello",
        "timestamp": "2025-12-29T..."
      },
      {
        "sender": "ai",
        "text": "Hello! How can I help?",
        "timestamp": "2025-12-29T..."
      }
    ]
  }
}
```

### GET `/health`

Health check endpoint.

**Response:**
```json
{
  "status": "success",
  "message": "Server is running"
}
```

## 🏗️ Architecture Overview

### Backend Architecture

The backend follows a layered architecture pattern:

**Flow**: Routes → Controllers → Services → Prisma

1. **Routes Layer** (`routes/`): Defines API endpoints and applies middleware
2. **Controllers Layer** (`controllers/`): Handles HTTP requests/responses, delegates to services
3. **Services Layer** (`services/`): Contains business logic:
   - `chatService.ts`: Manages conversations and message persistence
   - `llmService.ts`: Handles OpenAI API integration (LLM logic isolated for easy provider switching)
4. **Data Layer** (`utils/prisma.ts`): Prisma client for database operations
5. **Middleware** (`middleware/`):
   - Error handling via AppError + global error handler middleware
   - Rate limiting
   - Input validation

### Error Handling

- Custom `AppError` class for operational errors
- `catchAsync` wrapper to catch async errors automatically
- Global error handler middleware standardizes error responses
- All errors return consistent format: `{ status, message, statusCode }`

### Frontend Architecture

- **Component-based**: Modular Svelte components
- **State Management**: Local component state with localStorage for session persistence
- **API Integration**: Centralized API URL configuration via environment variables
- **UX Features**: Loading states, error handling, auto-scroll, disabled states

## 🤖 LLM Integration

### Provider
- **OpenAI GPT-3.5-turbo**: Cost-effective and fast for customer support use cases

### Model Details
- Model: `gpt-3.5-turbo`
- Max Tokens: 500 (configurable via `MAX_TOKENS` env var)
- Temperature: 0.7 (balanced creativity)

### Prompt Design

The system prompt includes:
- Role definition (helpful customer support agent for e-commerce store)
- Store information (shipping, returns, support hours, payment methods, international shipping)
- Behavioral guidelines (polite, helpful, admit when unsure, offer human handoff)

### Conversation Context

- Full conversation history is passed to the LLM for contextual responses
- System prompt is prepended to every conversation
- Messages are formatted as: `[{role: 'system'}, ...history, {role: 'user'}]`
- Max tokens limited to 500 for cost control

### Error Handling

- Handles API key errors (401) → User-friendly error message
- Handles rate limits (429) → Retry suggestion
- Handles service unavailability (503) → Graceful fallback
- All errors return consistent format: `{status: 'error', message: '...', statusCode: number}`

## 🔒 Security & Best Practices

- ✅ Environment variables for sensitive data
- ✅ Input validation and sanitization
- ✅ Rate limiting (100 requests per 15 minutes by default)
- ✅ CORS configuration
- ✅ Error messages don't leak sensitive information
- ✅ SQL injection protection via Prisma ORM
- ✅ Request size limits (10MB)

## 🧪 Testing the Application

1. **Start the application** (see Local Setup)
2. **Open** http://localhost:5173
3. **Try these test cases**:
   - Ask about shipping: "What's your shipping policy?"
   - Ask about returns: "Can I return items?"
   - Ask about support hours: "When are you available?"
   - Test error handling: Send a very long message (>2000 chars)
   - Test persistence: Send messages, reload page, verify history loads

## 🚢 Deployment

### Recommended Architecture

| Layer | Platform | Reason |
|-------|----------|--------|
| Frontend (Svelte) | **Vercel** | Excellent static hosting |
| Backend (Node + Prisma) | **Render** | Persistent server + DB |
| Database | SQLite (Render disk) | Simple & acceptable |

### Deploy Backend on Render

1. Go to [Render.com](https://render.com) → New → Web Service
2. Connect your GitHub repository
3. Configure:
   - **Root Directory**: `/` (root of repo - backend is at root level)
   - **Build Command**: `npm install && npm run prisma:generate && npm run build:backend`
   - **Start Command**: `npm start`
   - **Environment**: Node 18+
4. Add Environment Variables:
   ```env
   PORT=3000
   NODE_ENV=production
   OPENAI_API_KEY=your_key_here
   DATABASE_URL=file:./prod.db
   FRONTEND_URL=https://your-frontend-url.vercel.app
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   MAX_MESSAGE_LENGTH=2000
   MAX_TOKENS=500
   ```
5. Deploy and note your backend URL (e.g., `https://spur-ai-chat-backend.onrender.com`)

### Deploy Frontend on Vercel

1. Go to [Vercel.com](https://vercel.com) → New Project
2. Import your GitHub repository
3. Configure:
   - **Framework**: Svelte
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add Environment Variable:
   ```env
   VITE_API_URL=https://your-backend-url.onrender.com/api
   ```
5. Deploy and note your frontend URL

### Test Deployment

1. Visit your deployed frontend URL
2. Send a test message
3. Verify AI response appears
4. Refresh page - conversation should persist
5. Test error handling (send empty message)

For more detailed instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

## 📝 Trade-offs & Design Decisions

### Database Choice: SQLite
- **Pros**: Simple setup, no external dependencies, perfect for MVP
- **Cons**: Not suitable for high-concurrency production (would migrate to PostgreSQL)

### LLM Model: GPT-3.5-turbo
- **Pros**: Fast, cost-effective, good quality for customer support
- **Cons**: Less capable than GPT-4, but sufficient for this use case

### Frontend: Svelte
- **Pros**: Lightweight, fast, simple reactivity model
- **Cons**: Smaller ecosystem than React, but sufficient for this project

### Session Management
- Uses localStorage for client-side session persistence
- No authentication required (as per assignment)
- In production, would implement proper session management with secure cookies

## 🔮 Future Improvements

If I had more time, I would:

1. **Backend**:
   - **Streaming tokens** for real-time response display
   - **Redis caching** for frequently asked questions
   - Add unit and integration tests
   - Add conversation analytics and metrics
   - Add support for multiple LLM providers (Claude, etc.)
   - Implement conversation search and filtering

2. **Frontend**:
   - Implement streaming response display
   - Add message reactions/feedback
   - Add file upload support
   - Implement dark mode
   - Add accessibility improvements (ARIA labels, keyboard navigation)
   - Add message editing/deletion

3. **Infrastructure**:
   - Migrate to PostgreSQL for production
   - Add Docker containerization
   - Implement CI/CD pipeline
   - Add monitoring and logging (e.g., Sentry, DataDog)
   - Implement horizontal scaling

4. **Features**:
   - **Multi-channel abstraction** (WhatsApp, Instagram, Facebook)
   - Multi-language support
   - Handoff to human agents
   - Conversation export
   - Admin dashboard for conversation management
   - A/B testing for prompts

## 📄 License

MIT

## 👤 Author

Built as a technical assignment for Spur AI.

---

**Note**: This project is production-ready and follows best practices for error handling, validation, and code organization. All requirements from the assignment have been implemented.



