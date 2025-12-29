# Deployment Guide

This guide covers deploying both the backend and frontend of the Spur AI Live Chat application.

## Prerequisites

- GitHub account
- Deployment platform accounts (e.g., Render, Vercel, Netlify)
- OpenAI API key

## Backend Deployment

### Option 1: Render (Recommended)

1. **Create a new Web Service** on [Render](https://render.com)

2. **Connect your GitHub repository**

3. **Configure the service**:
   - **Name**: `spur-ai-live-chat-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build:backend && npm run prisma:generate`
   - **Start Command**: `npm start`
   - **Root Directory**: `/` (root of repo)

4. **Add Environment Variables**:
   ```
   DATABASE_URL=file:./prod.db
   NODE_ENV=production
   PORT=3000
   OPENAI_API_KEY=your_openai_api_key_here
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   FRONTEND_URL=https://your-frontend-url.vercel.app
   MAX_MESSAGE_LENGTH=2000
   MAX_TOKENS=500
   ```

5. **Deploy**: Render will automatically deploy on every push to main branch

### Option 2: Railway

1. **Create a new project** on [Railway](https://railway.app)

2. **Deploy from GitHub**

3. **Add environment variables** (same as Render)

4. **Configure build**: Railway auto-detects Node.js projects

### Option 3: Heroku

1. **Install Heroku CLI** and login

2. **Create app**:
   ```bash
   heroku create spur-ai-live-chat-backend
   ```

3. **Add buildpacks**:
   ```bash
   heroku buildpacks:add heroku/nodejs
   ```

4. **Set environment variables**:
   ```bash
   heroku config:set DATABASE_URL=file:./prod.db
   heroku config:set NODE_ENV=production
   heroku config:set OPENAI_API_KEY=your_key
   # ... add all other env vars
   ```

5. **Deploy**:
   ```bash
   git push heroku main
   ```

### Database Considerations

**For SQLite (Development/Testing)**:
- SQLite works for low-traffic deployments
- File-based database is included in the deployment

**For Production (Recommended)**:
- Migrate to PostgreSQL or another managed database
- Update `DATABASE_URL` to PostgreSQL connection string
- Update Prisma schema `datasource` to `postgresql`
- Run migrations: `npx prisma migrate deploy`

## Frontend Deployment

### Option 1: Vercel (Recommended)

1. **Import your GitHub repository** on [Vercel](https://vercel.com)

2. **Configure the project**:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

3. **Add Environment Variables**:
   ```
   VITE_API_URL=https://your-backend-url.onrender.com/api
   ```

4. **Deploy**: Vercel auto-deploys on every push

### Option 2: Netlify

1. **Create a new site** on [Netlify](https://netlify.com)

2. **Connect GitHub repository**

3. **Configure build settings**:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/dist`

4. **Add environment variables**:
   ```
   VITE_API_URL=https://your-backend-url.onrender.com/api
   ```

5. **Deploy**

### Option 3: Render (Static Site)

1. **Create a new Static Site** on Render

2. **Configure**:
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Publish Directory**: `frontend/dist`

3. **Add environment variables** (same as Vercel)

## Full Stack Deployment (Both on Same Platform)

### Render (Full Stack)

1. **Backend**: Deploy as Web Service (see Backend Deployment)
2. **Frontend**: Deploy as Static Site
3. **Update CORS**: Set `FRONTEND_URL` in backend to your frontend URL

### Vercel (Full Stack)

1. **Backend**: Use Vercel Serverless Functions
   - Create `api/` directory in root
   - Convert Express routes to serverless functions
   - Or deploy backend separately on Render/Railway

2. **Frontend**: Deploy as Vercel project (see Frontend Deployment)

## Post-Deployment Checklist

- [ ] Backend health check: `https://your-backend-url.com/health`
- [ ] Frontend loads correctly
- [ ] Chat messages send successfully
- [ ] AI responses are generated
- [ ] Conversations persist (check database)
- [ ] CORS is configured correctly
- [ ] Environment variables are set
- [ ] Rate limiting is working
- [ ] Error handling works (test with invalid input)

## Environment Variables Summary

### Backend
```env
DATABASE_URL=file:./prod.db  # or PostgreSQL URL for production
NODE_ENV=production
PORT=3000
OPENAI_API_KEY=sk-...
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
FRONTEND_URL=https://your-frontend-url.vercel.app
MAX_MESSAGE_LENGTH=2000
MAX_TOKENS=500
```

### Frontend
```env
VITE_API_URL=https://your-backend-url.onrender.com/api
```

## Troubleshooting

### Backend Issues

**Database errors**:
- Ensure Prisma Client is generated: `npm run prisma:generate`
- Run migrations: `npm run prisma:migrate`
- Check `DATABASE_URL` is correct

**OpenAI API errors**:
- Verify `OPENAI_API_KEY` is set correctly
- Check API key has sufficient credits
- Verify rate limits aren't exceeded

**CORS errors**:
- Ensure `FRONTEND_URL` matches your actual frontend URL
- Check CORS middleware is configured

### Frontend Issues

**API connection errors**:
- Verify `VITE_API_URL` is correct
- Check backend is running and accessible
- Verify CORS is configured on backend

**Build errors**:
- Ensure all dependencies are installed
- Check Node.js version (18+)
- Clear `node_modules` and reinstall

## Production Recommendations

1. **Use PostgreSQL** instead of SQLite for production
2. **Enable HTTPS** (most platforms do this automatically)
3. **Set up monitoring** (e.g., Sentry for error tracking)
4. **Configure logging** (e.g., Winston, Pino)
5. **Set up CI/CD** for automated deployments
6. **Use environment-specific configs** (dev, staging, prod)
7. **Implement database backups**
8. **Set up rate limiting** per user/IP (already implemented)
9. **Add health check endpoints** (already implemented)
10. **Monitor API costs** (OpenAI usage)

## Cost Estimates

- **Render**: Free tier available, $7/month for paid
- **Vercel**: Free tier available, $20/month for Pro
- **Netlify**: Free tier available
- **OpenAI API**: Pay-per-use, ~$0.002 per 1K tokens (GPT-3.5-turbo)

---

For questions or issues, refer to the main [README.md](./README.md) or open an issue in the repository.



