# Render Deployment Setup Guide

Complete guide to deploy your AI Sales Agent to Render.

## Prerequisites

You have already provided:
- ✅ GitHub username: `kazi2000`
- ✅ Email: `kaziubaid05@gmail.com`
- ✅ Supabase connector enabled
- ✅ GitHub connector enabled

## Step 1: Supabase Database Setup

### 1.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign in or create account
3. Click "New Project"
4. Fill in:
   - **Project name**: `ai-sales-agent`
   - **Database password**: Create a strong password and save it
   - **Region**: Choose closest to you
5. Click "Create new project" (wait 2-3 minutes)

### 1.2 Get Your Credentials

Once project is created:

1. Go to **Settings** → **API**
2. Copy these values:
   - **Project URL** → Save as `SUPABASE_URL`
   - **anon public** key → Save as `SUPABASE_KEY`

Example:
```
SUPABASE_URL=https://abcdefghijklmnop.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 1.3 Run Database Migrations

1. In Supabase dashboard, click **SQL Editor** (left sidebar)
2. Click **New Query**
3. Copy all SQL from the `migrations.sql` file in your repository
4. Paste into Supabase SQL editor
5. Click **Run** button
6. Wait for "Success" message

**What this creates:**
- `users` table - Store information
- `leads` table - Captured customer data
- `chat_memory` table - Conversation history
- `products` table - Synced products
- `interactions` table - User behavior tracking

---

## Step 2: Render Deployment

### 2.1 Create Render Account

1. Go to [render.com](https://render.com)
2. Click "Sign Up"
3. Use GitHub to sign up (easier)
4. Authorize Render to access your GitHub

### 2.2 Deploy to Render

1. Go to [render.com/dashboard](https://render.com/dashboard)
2. Click **New +** button (top right)
3. Select **Web Service**
4. Click **Connect account** under GitHub
5. Select your `ai-chat-backend` repository
6. Click **Connect**

### 2.3 Configure Service

Fill in these settings:

| Field | Value |
|-------|-------|
| **Name** | `ai-chat-backend` |
| **Environment** | `Node` |
| **Region** | Singapore (or closest to you) |
| **Branch** | `main` |
| **Build Command** | `npm install` |
| **Start Command** | `node server.js` |
| **Instance Type** | `Free` |

### 2.4 Add Environment Variables

Scroll to **Environment** section and add these variables:

| Key | Value | Where to get |
|-----|-------|--------------|
| `SHOPIFY_API_KEY` | Your Shopify API key | Shopify Partner Dashboard |
| `SHOPIFY_API_SECRET` | Your Shopify API secret | Shopify Partner Dashboard |
| `SUPABASE_URL` | From Step 1.2 | Supabase Settings → API |
| `SUPABASE_KEY` | From Step 1.2 | Supabase Settings → API |
| `OPENAI_API_KEY` | Your OpenAI API key | OpenAI Platform |
| `NODE_ENV` | `production` | Fixed value |
| `PORT` | `3000` | Fixed value |

### 2.5 Create Web Service

1. Scroll to bottom
2. Click **Create Web Service**
3. Render will start building (2-3 minutes)
4. Wait for green "Live" indicator

### 2.6 Get Your Render URL

Once deployed:
1. Look at the top of the page
2. You'll see your service URL: `https://ai-chat-backend-xxxx.onrender.com`
3. Copy this URL

### 2.7 Update APP_URL Variable

1. Go back to Render service settings
2. Click **Environment** tab
3. Find `APP_URL` variable
4. Update it with your Render URL from Step 2.6
5. Click **Save**
6. Render will redeploy automatically

---

## Step 3: Shopify Configuration

### 3.1 Update Redirect URI

1. Go to [Shopify Partner Dashboard](https://partners.shopify.com)
2. Click on your app
3. Go to **Configuration** tab
4. Find **Redirect URIs**
5. Update to: `https://your-render-url.onrender.com/auth/callback`
6. Click **Save**

### 3.2 Install App on Test Store

1. Go to your Shopify store admin
2. Go to **Apps and sales channels** → **App and sales channel settings**
3. Click **Develop apps**
4. Find your app and click **Install app**
5. You should see "✅ App Installed Successfully"

### 3.3 Verify Widget

1. Go to your storefront
2. Look for chat widget (💬 icon, bottom-right)
3. Click to open
4. Send test message: "Do you have any blue shirts?"
5. Verify AI responds

---

## Step 4: Verify Everything Works

### 4.1 Test Chat Widget

1. Visit your Shopify store
2. Open the chat widget
3. Send a test message
4. Verify AI responds

### 4.2 Test Admin Dashboard

1. Open browser and go to:
   ```
   https://your-render-url.onrender.com/api/admin/analytics?shop=your-store.myshopify.com
   ```
2. You should see JSON data with analytics

### 4.3 Check Render Logs

1. Go to Render dashboard
2. Click on your service
3. Go to **Logs** tab
4. Look for any error messages

---

## Troubleshooting

### Widget not appearing?
- [ ] Verify app is installed in Shopify admin
- [ ] Check Render logs for errors
- [ ] Verify `APP_URL` is correct
- [ ] Clear browser cache

### Chat not responding?
- [ ] Check OpenAI API key is valid
- [ ] Verify Supabase connection
- [ ] Check Render logs
- [ ] Verify all environment variables are set

### Leads not saving?
- [ ] Verify database migrations were run
- [ ] Check Supabase tables exist
- [ ] Verify Supabase connection string

### Render service crashing?
- [ ] Check all environment variables are set
- [ ] Review Render logs for errors
- [ ] Verify Node.js version compatibility

---

## Production Checklist

Before going live:

- [ ] Supabase database is set up
- [ ] Database migrations have been run
- [ ] Render service is deployed and running
- [ ] All environment variables are set
- [ ] Chat widget appears on storefront
- [ ] Leads are being captured
- [ ] Admin dashboard is accessible
- [ ] No errors in Render logs
- [ ] Shopify app is configured correctly
- [ ] HTTPS is enabled (Render default)

---

## Next Steps

After successful deployment:

1. **Test thoroughly** - Send multiple test messages
2. **Monitor logs** - Check Render dashboard regularly
3. **Customize** - Edit widget colors and text
4. **Optimize** - Adjust AI prompts
5. **Scale** - Upgrade Render instance if needed

---

## Support

- **Render Docs**: https://render.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **Shopify API**: https://shopify.dev/api
- **OpenAI Docs**: https://platform.openai.com/docs

---

**Your deployment is ready! Follow the steps above to go live. 🚀**
