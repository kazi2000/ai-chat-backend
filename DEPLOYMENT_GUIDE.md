# Complete Deployment Guide - AI Sales Agent

A comprehensive, step-by-step guide to deploy your AI Sales Agent app to Render with screenshots and detailed instructions.

## Overview

This guide will take you through deploying the AI Sales Agent to production in approximately 15-20 minutes. By the end, your app will be live and ready to install on Shopify stores.

## Prerequisites Checklist

Before starting, ensure you have:

- ✅ GitHub account with the repository pushed (kazi2000/ai-chat-backend)
- ✅ Render account (free tier available at render.com)
- ✅ Supabase account (free tier available at supabase.com)
- ✅ OpenAI API key (from platform.openai.com)
- ✅ Shopify Partner account with app credentials
- ✅ Your Shopify credentials (from Partner Dashboard):
  - Client ID
  - Client Secret

## Part 1: Set Up Supabase Database

### Step 1.1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "Sign In" (or create account if needed)
3. Click "New Project"
4. Fill in the form:
   - **Project name**: `ai-sales-agent`
   - **Database password**: Create a strong password
   - **Region**: Choose closest to your location
5. Click "Create new project" and wait 2-3 minutes for setup

### Step 1.2: Get Your Credentials

Once your project is created:

1. Click on your project name
2. Go to **Settings** → **API**
3. Copy these values and save them somewhere safe:
   - **Project URL** (under "API") → This is your `SUPABASE_URL`
   - **anon public** key → This is your `SUPABASE_KEY`

**Example:**
```
SUPABASE_URL=https://abcdefghijklmnop.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Step 1.3: Run Database Migrations

1. In Supabase dashboard, click **SQL Editor** (left sidebar)
2. Click **New Query**
3. Open the `migrations.sql` file from your repository
4. Copy **all** the SQL code
5. Paste it into the Supabase SQL editor
6. Click **Run** button
7. Wait for the query to complete (you should see "Success" message)

**What this does:** Creates all necessary database tables (users, leads, chat_memory, products, interactions) with proper indexes for performance.

---

## Part 2: Deploy to Render

### Step 2.1: Connect GitHub Repository

1. Go to [render.com](https://render.com)
2. Sign in or create account
3. Click **Dashboard** in top navigation
4. Click **New +** button (top right)
5. Select **Web Service**
6. Click **Connect account** under "GitHub"
7. Authorize Render to access your GitHub
8. Select repository: `ai-chat-backend`
9. Click **Connect**

### Step 2.2: Configure Service Settings

After connecting, you'll see the service configuration page:

| Setting | Value |
|---------|-------|
| **Name** | `ai-chat-backend` |
| **Environment** | `Node` |
| **Region** | `Singapore` (or closest to you) |
| **Branch** | `main` |
| **Build Command** | `npm install` |
| **Start Command** | `node server.js` |
| **Instance Type** | `Free` (for testing) or `Starter` (for production) |

Make sure these settings are correct, then proceed to the next step.

### Step 2.3: Add Environment Variables

This is the **most important step**. Your app needs these environment variables to function:

1. Scroll down to **Environment** section
2. Click **Add Environment Variable** for each of these:

| Key | Value | Source |
|-----|-------|--------|
| `SHOPIFY_API_KEY` | `your_shopify_api_key` | Your Shopify app credentials |
| `SHOPIFY_API_SECRET` | `your_shopify_api_secret` | Your Shopify app credentials |
| `SUPABASE_URL` | `https://your-project.supabase.co` | From Supabase (Step 1.2) |
| `SUPABASE_KEY` | `eyJhbGciOi...` | From Supabase (Step 1.2) |
| `OPENAI_API_KEY` | `sk-your-api-key-here` | From OpenAI platform |
| `APP_URL` | `https://ai-chat-backend-xxxx.onrender.com` | Will be assigned by Render (see Step 2.5) |
| `NODE_ENV` | `production` | Fixed value |
| `PORT` | `3000` | Fixed value |

**Important:** You'll get your `APP_URL` after Render creates the service. You can update it after deployment.

### Step 2.4: Create Web Service

1. Scroll to bottom of the page
2. Click **Create Web Service**
3. Render will start building and deploying your app
4. Wait for the build to complete (this takes 2-3 minutes)
5. You'll see a green "Live" indicator when deployment is successful

### Step 2.5: Get Your Render URL

Once deployed:

1. Look at the top of the page - you'll see your service URL
2. It will look like: `https://ai-chat-backend-xxxx.onrender.com`
3. Copy this URL

### Step 2.6: Update APP_URL Environment Variable

1. Go back to your Render service settings
2. Click on the **Environment** tab
3. Find the `APP_URL` variable
4. Update it with your Render URL from Step 2.5
5. Click **Save**
6. Render will automatically redeploy with the updated variable

---

## Part 3: Update Shopify App Configuration

### Step 3.1: Update Redirect URI

1. Go to [Shopify Partner Dashboard](https://partners.shopify.com)
2. Click on your app
3. Go to **Configuration** tab
4. Find **Redirect URIs** section
5. Update the redirect URI to:
   ```
   https://your-render-url.onrender.com/auth/callback
   ```
   (Replace `your-render-url` with your actual Render URL from Step 2.5)
6. Click **Save**

### Step 3.2: Test the Installation

1. Go to your Shopify store admin
2. Go to **Apps and sales channels** → **App and sales channel settings**
3. Click **Develop apps**
4. Find your app and click it
5. Click **Install app**
6. You should see a success message
7. Go to your storefront and verify the chat widget appears in the bottom-right corner

---

## Part 4: Verify Everything Works

### Step 4.1: Test Chat Widget

1. Visit your Shopify store
2. Look for the chat widget (bottom-right corner with 💬 icon)
3. Click to open it
4. Send a test message like: "Do you have any blue shirts?"
5. The AI should respond with product recommendations

### Step 4.2: Test Admin Dashboard

1. Open your browser and go to:
   ```
   https://your-render-url.onrender.com/api/admin/analytics?shop=your-store.myshopify.com
   ```
2. You should see JSON data with analytics
3. This confirms the backend is working

### Step 4.3: Test Leads Capture

1. In the chat widget, send a message with your email:
   ```
   My email is test@example.com
   ```
2. Go to Supabase dashboard
3. Click **Table Editor**
4. Select **leads** table
5. You should see your email captured

### Step 4.4: Check Render Logs

If something isn't working:

1. Go to your Render service dashboard
2. Click **Logs** tab
3. Look for error messages
4. Common issues:
   - Missing environment variables
   - Database connection errors
   - OpenAI API key invalid

---

## Part 5: Monitor Your Deployment

### Ongoing Monitoring

1. **Check Logs Regularly**: Go to Render dashboard → Logs to monitor for errors
2. **Monitor Usage**: Check Supabase dashboard for database usage
3. **Test Regularly**: Send test messages to ensure chat is working
4. **Watch for Errors**: Set up email notifications in Render for deployment failures

### Scaling Up

If you get high traffic:

1. Go to Render service settings
2. Change **Instance Type** from Free to Starter or higher
3. This ensures your app doesn't go to sleep during inactivity

---

## Part 6: Deploy Updates

Whenever you update your code:

1. Make changes locally
2. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Update: description of changes"
   git push origin main
   ```
3. Render will automatically detect the push and redeploy
4. Check the Render dashboard to see deployment progress

---

## Troubleshooting

### Issue: Widget not appearing on storefront

**Solution:**
1. Verify app is installed (check Shopify admin)
2. Check Render logs for errors
3. Verify `APP_URL` is correct in environment variables
4. Clear browser cache and reload storefront

### Issue: Chat not responding

**Solution:**
1. Check OpenAI API key is valid
2. Verify Supabase connection in Render logs
3. Check database tables exist (run migrations again)
4. Verify all environment variables are set

### Issue: Leads not saving

**Solution:**
1. Check Supabase database connection
2. Verify leads table exists
3. Check Render logs for SQL errors
4. Ensure database password is correct

### Issue: Render service keeps crashing

**Solution:**
1. Check all environment variables are set
2. Verify Node.js version compatibility
3. Check Render logs for specific error messages
4. Try restarting the service from Render dashboard

---

## Production Checklist

Before going live with real customers:

- [ ] All environment variables are set correctly
- [ ] Database migrations have been run
- [ ] Chat widget appears on storefront
- [ ] Leads are being captured
- [ ] Admin dashboard is accessible
- [ ] Test messages work end-to-end
- [ ] Render logs show no errors
- [ ] Supabase database is backing up automatically
- [ ] Shopify app is configured with correct redirect URI
- [ ] HTTPS is enabled (Render default)

---

## Getting Help

If you encounter issues:

1. **Check Render Logs**: Most issues are visible in the logs
2. **Verify Environment Variables**: Make sure all are set correctly
3. **Test Database Connection**: Try accessing Supabase directly
4. **Review API Documentation**: Check API_DOCUMENTATION.md for endpoint details
5. **Check GitHub Issues**: Look for similar problems reported by others

---

## Next Steps

After successful deployment:

1. **Customize Widget**: Edit widget.js to match your brand colors
2. **Set Up Admin Dashboard**: Deploy the React admin dashboard component
3. **Configure Analytics**: Set up monitoring and alerts
4. **Plan for Scale**: Consider upgrading Render instance for production
5. **Gather Feedback**: Test with real customers and iterate

---

## Quick Reference

| Component | URL |
|-----------|-----|
| **Render Dashboard** | https://dashboard.render.com |
| **Supabase Dashboard** | https://app.supabase.com |
| **Shopify Partner Dashboard** | https://partners.shopify.com |
| **Your App** | https://your-render-url.onrender.com |
| **Chat Widget** | Appears on your Shopify storefront |
| **Admin API** | https://your-render-url.onrender.com/api/admin/* |

---

## Support Resources

- **Render Docs**: https://render.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **Shopify API Docs**: https://shopify.dev/api
- **OpenAI Docs**: https://platform.openai.com/docs
- **Your Repository**: https://github.com/kazi2000/ai-chat-backend

---

**Congratulations!** Your AI Sales Agent is now deployed and ready to help your customers. 🎉
