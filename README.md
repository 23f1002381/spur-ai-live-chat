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

```bash
# Generate Prisma Client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate
```

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

1. **Routes Layer** (`routes/`): Defines API endpoints and applies middleware
2. **Controllers Layer** (`controllers/`): Handles HTTP requests/responses, delegates to services
3. **Services Layer** (`services/`): Contains business logic:
   - `chatService.ts`: Manages conversations and message persistence
   - `llmService.ts`: Handles OpenAI API integration
4. **Data Layer** (`utils/prisma.ts`): Prisma client for database operations
5. **Middleware** (`middleware/`):
   - Error handling with global error handler
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

### Prompt Design

The system prompt includes:
- Role definition (helpful customer support agent)
- Store information (shipping, returns, support hours, payment methods)
- Behavioral guidelines (polite, helpful, admit when unsure)

### Conversation Context

- Full conversation history is passed to the LLM for contextual responses
- System prompt is prepended to every conversation
- Max tokens limited to 500 for cost control

### Error Handling

- Handles API key errors (401)
- Handles rate limits (429)
- Handles service unavailability (503)
- Graceful fallback messages for users

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

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions for both backend and frontend.

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
   - Add unit and integration tests
   - Implement Redis caching for frequently asked questions
   - Add conversation analytics and metrics
   - Implement streaming responses for better UX
   - Add support for multiple LLM providers (Claude, etc.)
   - Implement conversation search and filtering

2. **Frontend**:
   - Add message timestamps in a more readable format
   - Implement message reactions/feedback
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



