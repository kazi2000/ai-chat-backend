# Deployment Guide - AI Sales Agent

This guide walks you through deploying the AI Sales Agent app to production on Render.

## Prerequisites

Before you start, ensure you have:

1. **GitHub Account** - Repository for code
2. **Render Account** - For hosting (render.com)
3. **Supabase Account** - Database hosting
4. **OpenAI Account** - API access
5. **Shopify Partner Account** - App credentials
6. **Shopify Store** - For testing

## Step 1: Prepare Your Repository

### 1.1 Create GitHub Repository
```bash
# Initialize git if not already done
git init
git add .
git commit -m "Initial commit: AI Sales Agent"

# Create repository on GitHub and push
git remote add origin https://github.com/YOUR_USERNAME/ai-chat-backend.git
git branch -M main
git push -u origin main
```

### 1.2 Update Configuration Files
Ensure these files are in your repository:
- `package.json` - Dependencies
- `server.js` - Main application
- `widget.js` - Storefront widget
- `.env.example` - Environment template
- `migrations.sql` - Database schema
- `README.md` - Documentation

## Step 2: Set Up Supabase

### 2.1 Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note your project URL and anon key

### 2.2 Run Database Migrations
1. Open Supabase SQL editor
2. Copy and paste contents of `migrations.sql`
3. Execute the SQL

### 2.3 Get Your Credentials
- **SUPABASE_URL**: From project settings
- **SUPABASE_KEY**: Anon key from API settings

## Step 3: Configure Shopify App

### 3.1 Create Shopify App
1. Go to [Shopify Partner Dashboard](https://partners.shopify.com)
2. Create a new app
3. In app setup, configure:
   - **App name**: AI Sales Agent
   - **Admin API scopes**:
     - `read_products`
     - `write_script_tags`
     - `read_script_tags`
   - **Redirect URIs**: (will update after Render deployment)

### 3.2 Get Shopify Credentials
- **SHOPIFY_API_KEY**: From app credentials
- **SHOPIFY_API_SECRET**: From app credentials

## Step 4: Deploy to Render

### 4.1 Connect Repository to Render
1. Go to [render.com](https://render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Select the repository

### 4.2 Configure Render Service
1. **Name**: `ai-chat-backend`
2. **Environment**: Node
3. **Build Command**: `npm install`
4. **Start Command**: `npm start`
5. **Instance Type**: Free (or Starter for production)

### 4.3 Add Environment Variables
In Render dashboard, add these environment variables:

```
SHOPIFY_API_KEY=your_shopify_api_key
SHOPIFY_API_SECRET=your_shopify_api_secret
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_supabase_anon_key
OPENAI_API_KEY=sk-your_openai_api_key
APP_URL=https://your-render-url.onrender.com
NODE_ENV=production
PORT=3000
```

### 4.4 Deploy
1. Click "Create Web Service"
2. Render will automatically deploy from main branch
3. Wait for deployment to complete
4. Note your Render URL (e.g., `https://ai-chat-backend-c3y7.onrender.com`)

## Step 5: Update Shopify App Configuration

### 5.1 Set Redirect URI
1. Go to Shopify Partner Dashboard
2. In your app settings, set:
   - **Redirect URIs**: `https://your-render-url.onrender.com/auth/callback`

### 5.2 Create Installation Link
Your app installation link will be:
```
https://your-store.myshopify.com/admin/apps/install?api_key=YOUR_SHOPIFY_API_KEY
```

## Step 6: Test the Installation

### 6.1 Install on Test Store
1. Go to your Shopify store admin
2. Use the installation link above
3. Authorize the app
4. You should see the chat widget on your storefront

### 6.2 Test Chat Widget
1. Visit your Shopify store
2. Look for the chat widget (bottom-right corner)
3. Send a test message
4. Verify AI responds

### 6.3 Test Admin Dashboard
1. Navigate to `https://your-render-url.onrender.com/api/admin/analytics?shop=your-store.myshopify.com`
2. Verify you see analytics data

## Step 7: Monitor and Maintain

### 7.1 View Logs
In Render dashboard:
1. Click on your service
2. Go to "Logs" tab
3. View real-time logs

### 7.2 Monitor Performance
- Check response times
- Monitor error rates
- Track database queries

### 7.3 Update Code
To deploy updates:
```bash
git add .
git commit -m "Update: feature description"
git push origin main
```
Render will automatically redeploy.

## Troubleshooting

### Issue: Widget not appearing on storefront

**Solution:**
1. Check Shopify script tags were created
2. Verify `APP_URL` environment variable is correct
3. Check browser console for JavaScript errors
4. Ensure app is installed (OAuth completed)

### Issue: Chat not responding

**Solution:**
1. Verify OpenAI API key is valid
2. Check Supabase connection
3. Review Render logs for errors
4. Ensure database tables exist (run migrations)

### Issue: Leads not saving

**Solution:**
1. Check Supabase database tables exist
2. Verify database connection string
3. Check Render logs for SQL errors
4. Ensure leads table has correct schema

### Issue: Render service keeps crashing

**Solution:**
1. Check environment variables are set
2. Review Render logs for errors
3. Verify Node.js version compatibility
4. Check for memory leaks in code

## Production Checklist

Before going live, ensure:

- [ ] All environment variables are set in Render
- [ ] Database migrations have been run
- [ ] Shopify app is configured with correct redirect URI
- [ ] Chat widget appears on storefront
- [ ] Leads are being captured
- [ ] Analytics dashboard is accessible
- [ ] Error handling is in place
- [ ] Logs are being monitored
- [ ] Backup strategy is in place
- [ ] HTTPS is enabled (Render default)

## Scaling for Production

### Database
- Monitor Supabase usage
- Add indexes for frequently queried columns
- Consider upgrading Supabase plan if needed

### Application
- Monitor Render CPU/memory usage
- Upgrade to Starter plan if needed
- Consider load balancing for high traffic

### API Rate Limiting
Consider adding rate limiting to prevent abuse:
```javascript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/chat', limiter);
```

## Backup and Recovery

### Database Backups
Supabase automatically backs up your database. To restore:
1. Go to Supabase dashboard
2. Click "Backups" in project settings
3. Select a backup and restore

### Code Backups
GitHub serves as your code backup. To recover:
```bash
git clone https://github.com/YOUR_USERNAME/ai-chat-backend.git
```

## Support

For deployment issues:
1. Check Render logs
2. Verify environment variables
3. Test database connection
4. Review Shopify app configuration
5. Check OpenAI API status

## Next Steps

After successful deployment:
1. Promote app to production in Shopify Partner Dashboard
2. Submit app to Shopify App Store (optional)
3. Set up monitoring and alerts
4. Plan for scaling
5. Gather user feedback
