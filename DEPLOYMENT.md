# Deployment Guide

This project is a monorepo with:

- `apps/web` - Next.js frontend
- `apps/api` - Express + WebSocket + BullMQ backend
- `packages/shared` - shared TypeScript schemas

Recommended deployment:

- Frontend: Vercel
- Backend: Render
- Database: MongoDB Atlas
- Redis: Redis Cloud, Upstash Redis TCP, or any hosted Redis provider that gives a `redis://` / `rediss://` URL

## 1. Push to GitHub

```bash
git add .
git commit -m "Build VedaAI assessment creator"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

Do not commit `.env`. It is ignored because it contains secrets.

## 2. Create Hosted MongoDB

Create a MongoDB Atlas cluster, then copy the application connection string.

It will look like:

```text
mongodb+srv://USER:PASSWORD@cluster-name.xxxxx.mongodb.net/vedaai?retryWrites=true&w=majority
```

Use that value as `MONGODB_URI` in the backend host.

## 3. Create Hosted Redis

Create a hosted Redis database and copy the TCP connection URL.

Use one of these formats as `REDIS_URL`:

```text
redis://USER:PASSWORD@HOST:PORT
rediss://USER:PASSWORD@HOST:PORT
```

This backend uses BullMQ, so use a Redis provider/plan that supports normal Redis commands over TCP.

## 4. Deploy Backend on Render

Create a new Render Web Service from the GitHub repo.

Settings:

```text
Root Directory: .
Build Command: npm install && npm run build -w packages/shared && npm run build -w apps/api
Start Command: npm run start -w apps/api
```

Environment variables:

```text
NODE_ENV=production
MONGODB_URI=your_mongodb_atlas_connection_string
REDIS_URL=your_hosted_redis_url
OPENAI_API_KEY=your_openai_key
OPENAI_MODEL=gpt-4o-mini
CORS_ORIGIN=https://your-vercel-app.vercel.app,http://localhost:3000
```

After deploy, test:

```text
https://your-api-service.onrender.com/health
```

You should see:

```json
{ "ok": true, "service": "vedaai-api" }
```

## 5. Deploy Frontend on Vercel

Import the same GitHub repo into Vercel.

Settings:

```text
Root Directory: apps/web
Framework Preset: Next.js
Install Command: cd ../.. && npm install
Build Command: cd ../.. && npm run build -w packages/shared && npm run build -w apps/web
Output Directory: apps/web/.next
```

Environment variables:

```text
NEXT_PUBLIC_API_URL=https://your-api-service.onrender.com
NEXT_PUBLIC_WS_URL=wss://your-api-service.onrender.com
```

Deploy and open the Vercel URL.

## 6. Update Backend CORS

After Vercel gives you the final frontend URL, go back to Render and set:

```text
CORS_ORIGIN=https://your-vercel-app.vercel.app
```

If you also want local development to keep working, use a comma-separated value:

```text
CORS_ORIGIN=https://your-vercel-app.vercel.app,http://localhost:3000
```

Redeploy the backend after changing environment variables.

## 7. Submission Links

Submit:

- GitHub repo link: `https://github.com/YOUR_USERNAME/YOUR_REPO`
- Deployment link: your Vercel frontend URL

Keep the backend URL in the README too, but the main submission deployment link should be the frontend.

## Common Fixes

If generation stays stuck:

- Check Render logs.
- Confirm `REDIS_URL` is correct and supports TCP Redis.
- Confirm MongoDB Atlas Network Access allows the backend host.
- Confirm `OPENAI_API_KEY` is set. The app still has a local fallback generator, but the AI path needs the key.

If the frontend cannot reach the API:

- Check `NEXT_PUBLIC_API_URL`.
- Check `NEXT_PUBLIC_WS_URL`.
- Check backend `CORS_ORIGIN`.
- Make sure the backend URL uses `https://` and the WebSocket URL uses `wss://`.
