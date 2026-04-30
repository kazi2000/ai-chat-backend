# Complete Deployment Checklist

Follow this checklist to deploy your AI Sales Agent from start to finish.

## 📋 Pre-Deployment (Gather Information)

### Credentials
- [ ] Shopify API Key: (from Shopify Partner Dashboard)
- [ ] Shopify API Secret: (from Shopify Partner Dashboard)
- [ ] OpenAI API Key: (from platform.openai.com)
- [ ] Your Shopify store domain: (mystore.myshopify.com)

### Accounts
- [ ] GitHub account: `kazi2000` ✅
- [ ] Email: `kaziubaid05@gmail.com` ✅
- [ ] Render account: (render.com)
- [ ] Supabase account: (supabase.com)

---

## 🗄️ Phase 1: Supabase Database Setup (10 minutes)

### Create Project
- [ ] Go to supabase.com
- [ ] Sign in or create account
- [ ] Click "New Project"
- [ ] Enter project name: `ai-sales-agent`
- [ ] Create strong database password
- [ ] Choose region (Singapore recommended)
- [ ] Click "Create new project"
- [ ] Wait 2-3 minutes for setup

### Get Credentials
- [ ] Go to Settings → API
- [ ] Copy Project URL → Save as `SUPABASE_URL`
- [ ] Copy anon public key → Save as `SUPABASE_KEY`

### Run Migrations
- [ ] Click SQL Editor
- [ ] Click New Query
- [ ] Copy all SQL from `migrations.sql` file
- [ ] Paste into SQL editor
- [ ] Click Run
- [ ] Verify "Success" message

### Verify Tables
- [ ] Click Table Editor
- [ ] Verify these tables exist:
  - [ ] users
  - [ ] leads
  - [ ] chat_memory
  - [ ] products
  - [ ] interactions

**Status: ✅ Supabase Ready**

---

## 🚀 Phase 2: Render Deployment (15 minutes)

### Create Render Account
- [ ] Go to render.com
- [ ] Click "Sign Up"
- [ ] Use GitHub to sign up (easier)
- [ ] Authorize Render to access GitHub

### Deploy Service
- [ ] Go to render.com/dashboard
- [ ] Click "New +" button
- [ ] Select "Web Service"
- [ ] Click "Connect account" under GitHub
- [ ] Select `ai-chat-backend` repository
- [ ] Click "Connect"

### Configure Service
- [ ] Name: `ai-chat-backend`
- [ ] Environment: `Node`
- [ ] Region: `Singapore` (or closest)
- [ ] Branch: `main`
- [ ] Build Command: `npm install`
- [ ] Start Command: `node server.js`
- [ ] Instance Type: `Free`

### Add Environment Variables
- [ ] `SHOPIFY_API_KEY` = Your Shopify API key
- [ ] `SHOPIFY_API_SECRET` = Your Shopify API secret
- [ ] `SUPABASE_URL` = From Supabase (Step 1)
- [ ] `SUPABASE_KEY` = From Supabase (Step 1)
- [ ] `OPENAI_API_KEY` = Your OpenAI API key
- [ ] `NODE_ENV` = `production`
- [ ] `PORT` = `3000`

### Deploy
- [ ] Click "Create Web Service"
- [ ] Wait for build to complete (2-3 minutes)
- [ ] Verify green "Live" indicator appears

### Get Render URL
- [ ] Copy your service URL from top of page
- [ ] Format: `https://ai-chat-backend-xxxx.onrender.com`
- [ ] Save this URL

### Update APP_URL
- [ ] Go to Environment tab
- [ ] Add `APP_URL` = Your Render URL
- [ ] Click Save
- [ ] Wait for redeploy

**Status: ✅ Render Deployed**

---

## 🛍️ Phase 3: Shopify Configuration (5 minutes)

### Update Redirect URI
- [ ] Go to Shopify Partner Dashboard
- [ ] Click on your app
- [ ] Go to Configuration tab
- [ ] Find Redirect URIs section
- [ ] Update to: `https://your-render-url.onrender.com/auth/callback`
- [ ] Click Save

### Install App
- [ ] Go to your Shopify store admin
- [ ] Go to Apps and sales channels → App and sales channel settings
- [ ] Click Develop apps
- [ ] Find your app
- [ ] Click "Install app"
- [ ] Verify "✅ App Installed Successfully" message

### Verify Widget
- [ ] Go to your storefront
- [ ] Look for chat widget (💬 icon, bottom-right)
- [ ] Click to open
- [ ] Verify widget appears

**Status: ✅ Shopify Configured**

---

## ✅ Phase 4: Verification (10 minutes)

### Test Chat Widget
- [ ] Send test message: "Do you have any blue shirts?"
- [ ] Verify AI responds with product recommendations
- [ ] Send message with email: "My email is test@example.com"
- [ ] Verify message is processed

### Test Admin Dashboard
- [ ] Open: `https://your-render-url.onrender.com/api/admin/analytics?shop=your-store.myshopify.com`
- [ ] Verify JSON data appears
- [ ] Check for metrics data

### Check Logs
- [ ] Go to Render dashboard
- [ ] Click on your service
- [ ] Go to Logs tab
- [ ] Verify no error messages
- [ ] Look for "Server running" message

### Test Leads Capture
- [ ] Go to Supabase dashboard
- [ ] Click Table Editor
- [ ] Click on `leads` table
- [ ] Verify your test email is there

**Status: ✅ Everything Working**

---

## 📊 Post-Deployment (Ongoing)

### Monitor
- [ ] Check Render logs daily for errors
- [ ] Monitor Supabase usage
- [ ] Test chat regularly
- [ ] Watch for performance issues

### Customize
- [ ] Edit widget colors in `widget.js`
- [ ] Update AI prompts in `server.js`
- [ ] Customize welcome message
- [ ] Adjust product recommendation logic

### Scale
- [ ] If high traffic, upgrade Render instance
- [ ] Monitor database usage
- [ ] Set up monitoring and alerts
- [ ] Plan for future growth

### Maintain
- [ ] Keep dependencies updated
- [ ] Monitor error logs
- [ ] Backup database regularly
- [ ] Test updates before deploying

---

## 🆘 Troubleshooting

### Widget not appearing?
- [ ] Verify app is installed in Shopify admin
- [ ] Check Render logs for errors
- [ ] Verify APP_URL is correct
- [ ] Clear browser cache
- [ ] Try incognito/private mode

### Chat not responding?
- [ ] Verify OpenAI API key is valid
- [ ] Check Supabase connection in Render logs
- [ ] Verify all environment variables are set
- [ ] Check database tables exist
- [ ] Review Render logs for specific errors

### Leads not saving?
- [ ] Verify database migrations were run
- [ ] Check Supabase tables exist
- [ ] Verify Supabase connection string
- [ ] Check Render logs for SQL errors

### Render service crashing?
- [ ] Check all environment variables are set
- [ ] Verify Node.js version compatibility
- [ ] Review Render logs for error messages
- [ ] Try restarting service from Render dashboard

---

## 📞 Support Resources

### Documentation
- `SUPABASE_SETUP.md` - Supabase setup guide
- `RENDER_SETUP.md` - Render deployment guide
- `API_DOCUMENTATION.md` - API reference
- `README.md` - Project overview

### External Resources
- **Render Docs**: https://render.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **Shopify API**: https://shopify.dev/api
- **OpenAI Docs**: https://platform.openai.com/docs

### Dashboards
- **Render Dashboard**: https://dashboard.render.com
- **Supabase Dashboard**: https://app.supabase.com
- **Shopify Partner**: https://partners.shopify.com
- **OpenAI Platform**: https://platform.openai.com

---

## ⏱️ Total Time Estimate

| Phase | Time | Status |
|-------|------|--------|
| Supabase Setup | 10 min | ⏳ |
| Render Deployment | 15 min | ⏳ |
| Shopify Config | 5 min | ⏳ |
| Verification | 10 min | ⏳ |
| **Total** | **40 min** | ⏳ |

---

## 🎯 Success Criteria

Your deployment is successful when:

- ✅ Supabase project is created and tables exist
- ✅ Render service is deployed and shows "Live"
- ✅ Chat widget appears on your Shopify storefront
- ✅ AI responds to test messages
- ✅ Leads are captured in Supabase
- ✅ Admin dashboard shows analytics
- ✅ No errors in Render logs
- ✅ All environment variables are set

---

## 🚀 You're Ready!

Follow this checklist step-by-step and your AI Sales Agent will be live in about 40 minutes.

**Start with Phase 1: Supabase Database Setup** 🎉
