# Quick Start Guide

Get the Spur AI Live Chat running in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))

## Steps

### 1. Install Dependencies

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### 2. Set Up Environment Variables

**Backend (.env in root):**
```bash
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY
```

**Frontend (.env in frontend/):**
```bash
cd frontend
echo "VITE_API_URL=http://localhost:3000/api" > .env
cd ..
```

### 3. Set Up Database

```bash
# Generate Prisma Client
npm run prisma:generate

# Create database and run migrations
npm run prisma:migrate
```

### 4. Start the Application

```bash
# Start both backend and frontend
npm run dev
```

### 5. Open in Browser

Navigate to: **http://localhost:5173**

## That's It! 🎉

Try asking:
- "What's your shipping policy?"
- "Can I return items?"
- "When are you available?"

## Troubleshooting

**Port already in use?**
- Backend: Change `PORT` in `.env`
- Frontend: Change port in `frontend/vite.config.js`

**OpenAI API errors?**
- Verify your API key in `.env`
- Check you have credits in your OpenAI account

**Database errors?**
- Run `npm run prisma:generate` again
- Delete `dev.db` and run `npm run prisma:migrate` again

## Next Steps

- Read the full [README.md](./README.md) for detailed documentation
- Check [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment instructions



