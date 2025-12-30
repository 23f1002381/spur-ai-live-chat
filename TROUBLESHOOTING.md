# Troubleshooting Guide

## Issue: Messages Not Appearing After Clicking Send

### Quick Checks

1. **Is the backend running?**
   ```bash
   # Check if backend is running on port 3000
   # You should see: "Server running on port 3000"
   ```

2. **Is the frontend running?**
   ```bash
   # Frontend should be on http://localhost:5173
   ```

3. **Open browser console (F12)** and check for errors

### Step-by-Step Debugging

#### 1. Check Backend is Running

**Terminal 1 (Backend):**
```bash
npm run dev:backend
```

You should see:
```
Server running on port 3000
Environment: development
```

**If backend doesn't start:**
- Check if port 3000 is already in use
- Verify `.env` file exists with `OPENAI_API_KEY`
- Run `npm run prisma:generate` first
- Check for errors in terminal

#### 2. Check Frontend is Running

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

You should see:
```
VITE v5.x.x  ready in xxx ms
➜  Local:   http://localhost:5173/
```

#### 3. Check Browser Console

1. Open browser (Chrome/Firefox)
2. Press **F12** to open Developer Tools
3. Go to **Console** tab
4. Try sending a message
5. Look for:
   - Red error messages
   - Network errors
   - API URL being used

#### 4. Check Network Tab

1. In Developer Tools, go to **Network** tab
2. Try sending a message
3. Look for:
   - Request to `/api/chat/message`
   - Status code (should be 200)
   - Response body

#### 5. Verify Environment Variables

**Backend `.env` file should have:**
```env
# Add your API key here (do NOT commit secrets to the repo)
OPENAI_API_KEY=REPLACE_WITH_YOUR_KEY
DATABASE_URL="file:./dev.db"
PORT=3000
FRONTEND_URL=http://localhost:5173
```

**Frontend `.env` file (in `frontend/` folder) should have:**
```env
VITE_API_URL=http://localhost:3000/api
```

### Common Issues & Solutions

#### Issue: "Failed to fetch" or Network Error

**Cause:** Backend not running or wrong API URL

**Solution:**
1. Make sure backend is running: `npm run dev:backend`
2. Check `VITE_API_URL` in `frontend/.env`
3. Verify backend is on port 3000

#### Issue: Messages appear but no AI response

**Cause:** AI provider API key issue or backend error

**Solution:**
1. Check backend terminal for errors
2. Verify `OPENAI_API_KEY` or `GROQ_API_KEY` in `.env` is correct (this project uses GROQ by default)
3. Check provider account has credits
4. Look at browser console for error messages

**Note:** If you see `AI provider misconfigured: GROQ_API_KEY is missing` the server is telling you no GROQ key is set. In **development** the server will fall back to a harmless local mock so you can continue testing; in **production** you must set one of the following env vars: `GROQ_API_KEY`, `GROQ_API`, `GROQ_API_TOKEN`, or `GROQ_KEY`.

#### Issue: "CORS error"

**Cause:** Frontend URL not allowed in backend CORS

**Solution:**
1. Check `FRONTEND_URL` in backend `.env` matches frontend URL
2. Default should be: `http://localhost:5173`

#### Issue: Messages don't show up at all

**Cause:** Reactivity issue or JavaScript error

**Solution:**
1. Check browser console for JavaScript errors
2. Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
3. Clear browser cache
4. Check if `messages` array is updating (add `console.log(messages)` in `sendMessage`)

### Testing the Backend Directly

Test if backend works with curl or Postman:

```bash
# Test health endpoint
curl http://localhost:3000/health

# Test chat endpoint
curl -X POST http://localhost:3000/api/chat/message \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello"}'
```

### Reset Everything

If nothing works, try a clean reset:

```bash
# Stop all servers (Ctrl+C)

# Delete database
rm dev.db dev.db-journal

# Regenerate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Start fresh
npm run dev
```

### Still Not Working?

1. Check all terminal outputs for errors
2. Check browser console (F12) for errors
3. Verify all environment variables are set
4. Make sure both backend and frontend are running
5. Try accessing backend directly: http://localhost:3000/health

---

**Need more help?** Check the main [README.md](./README.md) for setup instructions.

