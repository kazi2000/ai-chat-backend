# Quick Start - Deploy in 15 Minutes

Follow this checklist to deploy your AI Sales Agent in 15 minutes.

## ⏱️ Time Estimate: 15 minutes

---

## Step 1: Prepare Credentials (2 minutes)

Gather these credentials before starting:

- [ ] **Shopify API Key**: Get from Shopify Partner Dashboard
- [ ] **Shopify API Secret**: Get from Shopify Partner Dashboard
- [ ] **OpenAI API Key**: Get from [platform.openai.com](https://platform.openai.com)
- [ ] **GitHub Account**: With access to kazi2000/ai-chat-backend

---

## Step 2: Set Up Supabase Database (3 minutes)

1. [ ] Go to [supabase.com](https://supabase.com)
2. [ ] Sign in or create account
3. [ ] Click "New Project"
4. [ ] Fill in:
   - Project name: `ai-sales-agent`
   - Password: Create strong password
   - Region: Choose closest to you
5. [ ] Click "Create new project" and wait 2-3 minutes
6. [ ] Go to **Settings** → **API**
7. [ ] Copy and save:
   - **Project URL** → `SUPABASE_URL`
   - **anon public key** → `SUPABASE_KEY`
8. [ ] Go to **SQL Editor**
9. [ ] Click **New Query**
10. [ ] Copy all SQL from `migrations.sql` file
11. [ ] Paste into Supabase SQL editor
12. [ ] Click **Run**
13. [ ] Verify "Success" message appears

---

## Step 3: Deploy to Render (5 minutes)

1. [ ] Go to [render.com](https://render.com)
2. [ ] Sign in or create account
3. [ ] Click **Dashboard**
4. [ ] Click **New +** → **Web Service**
5. [ ] Click **Connect account** under GitHub
6. [ ] Authorize and select `ai-chat-backend` repository
7. [ ] Click **Connect**
8. [ ] Configure settings:
   - Name: `ai-chat-backend`
   - Environment: `Node`
   - Branch: `main`
   - Build Command: `npm install`
   - Start Command: `node server.js`
   - Instance Type: `Free`
9. [ ] Scroll to **Environment** section
10. [ ] Add these environment variables:

| Key | Value |
|-----|-------|
| `SHOPIFY_API_KEY` | Your Shopify API key |
| `SHOPIFY_API_SECRET` | Your Shopify API secret |
| `SUPABASE_URL` | Your Supabase URL from Step 2 |
| `SUPABASE_KEY` | Your Supabase key from Step 2 |
| `OPENAI_API_KEY` | Your OpenAI API key |
| `NODE_ENV` | `production` |
| `PORT` | `3000` |

11. [ ] Click **Create Web Service**
12. [ ] Wait for deployment (2-3 minutes)
13. [ ] Copy your Render URL (e.g., `https://ai-chat-backend-xxxx.onrender.com`)

---

## Step 4: Update Configuration (2 minutes)

1. [ ] Go back to Render dashboard
2. [ ] Add environment variable:
   - Key: `APP_URL`
   - Value: Your Render URL from Step 3
3. [ ] Click **Save**
4. [ ] Render will redeploy automatically
5. [ ] Go to [Shopify Partner Dashboard](https://partners.shopify.com)
6. [ ] Click on your app
7. [ ] Go to **Configuration**
8. [ ] Update **Redirect URI** to:
   ```
   https://your-render-url.onrender.com/auth/callback
   ```
9. [ ] Click **Save**

---

## Step 5: Test Installation (3 minutes)

1. [ ] Go to your Shopify store admin
2. [ ] Go to **Apps and sales channels** → **App and sales channel settings**
3. [ ] Click **Develop apps**
4. [ ] Find your app and click **Install app**
5. [ ] You should see "✅ App Installed Successfully"
6. [ ] Go to your storefront
7. [ ] Look for chat widget (💬 icon, bottom-right)
8. [ ] Click to open
9. [ ] Send test message: "Do you have any blue shirts?"
10. [ ] Verify AI responds with product recommendations

---

## ✅ Deployment Complete!

Your AI Sales Agent is now live! 🎉

### What's Working:
- ✅ Chat widget on your storefront
- ✅ AI product recommendations
- ✅ Lead capture (names, emails, phones)
- ✅ Admin analytics dashboard
- ✅ Free tier (50 messages/month)

### Next Steps:
1. **Test thoroughly** - Send multiple test messages
2. **Monitor logs** - Check Render dashboard for errors
3. **Customize** - Edit widget colors and text
4. **Scale** - Upgrade Render instance if needed
5. **Promote** - Share with your store team

---

## Troubleshooting

### Widget not appearing?
- [ ] Verify app is installed in Shopify admin
- [ ] Check browser console for errors
- [ ] Clear cache and reload page
- [ ] Check Render logs for errors

### Chat not responding?
- [ ] Verify OpenAI API key is valid
- [ ] Check Supabase database connection
- [ ] Verify all environment variables are set
- [ ] Check Render logs for error messages

### Leads not saving?
- [ ] Verify database migrations were run
- [ ] Check Supabase tables exist
- [ ] Verify Supabase connection string is correct

---

## Need Help?

1. **Check Logs**: Go to Render dashboard → Logs
2. **Read Docs**: See DEPLOYMENT_GUIDE.md for detailed instructions
3. **Review API**: See API_DOCUMENTATION.md for endpoint details
4. **GitHub Issues**: Check for similar problems

---

## Quick Reference

| Component | URL |
|-----------|-----|
| Render Dashboard | https://dashboard.render.com |
| Supabase Dashboard | https://app.supabase.com |
| Shopify Partner | https://partners.shopify.com |
| Your App | https://your-render-url.onrender.com |
| Chat Widget | On your Shopify storefront |

---

**Congratulations!** Your AI Sales Agent is deployed and ready to help customers. 🚀
