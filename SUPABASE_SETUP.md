# Supabase Database Setup Guide

Complete step-by-step guide to set up your Supabase database for the AI Sales Agent.

## Step 1: Create Supabase Project

### 1.1 Sign Up / Sign In

1. Go to [supabase.com](https://supabase.com)
2. Click "Sign In" or "Start your project"
3. Sign in with GitHub (recommended) or email
4. Authorize Supabase to access your GitHub

### 1.2 Create New Project

1. Click **New Project** or **Create a new project**
2. Fill in the form:
   - **Project name**: `ai-sales-agent`
   - **Database password**: Create a strong password (save it!)
   - **Region**: Choose closest to you
     - Singapore (Asia)
     - US East (North America)
     - EU West (Europe)
3. Click **Create new project**
4. Wait 2-3 minutes for setup to complete

### 1.3 Verify Project Created

You should see:
- Project name in the sidebar
- Green "Live" status
- Database is ready to use

---

## Step 2: Get Your Credentials

### 2.1 Find Your Project URL

1. In Supabase dashboard, click **Settings** (left sidebar)
2. Click **API** tab
3. Look for **Project URL**
4. Copy it (looks like: `https://abcdefghijklmnop.supabase.co`)
5. Save as `SUPABASE_URL`

### 2.2 Find Your API Key

1. Still in **Settings** → **API**
2. Look for **API Keys** section
3. Find the **anon public** key
4. Copy it (long string starting with `eyJ...`)
5. Save as `SUPABASE_KEY`

### 2.3 Save Your Credentials

You now have:
```
SUPABASE_URL=https://abcdefghijklmnop.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Keep these safe! You'll need them for Render deployment.

---

## Step 3: Run Database Migrations

### 3.1 Open SQL Editor

1. In Supabase dashboard, click **SQL Editor** (left sidebar)
2. Click **New Query** button
3. You should see an empty SQL editor

### 3.2 Copy Migration SQL

1. Open the `migrations.sql` file from your repository
2. Copy **all** the SQL code
3. It should be about 200+ lines

### 3.3 Paste and Run

1. In Supabase SQL editor, paste the SQL
2. Click **Run** button (or press Ctrl+Enter)
3. Wait for execution to complete
4. You should see "Success" message

### 3.4 Verify Tables Created

1. Click **Table Editor** (left sidebar)
2. You should see these tables:
   - `users`
   - `leads`
   - `chat_memory`
   - `products`
   - `interactions`

If you see all 5 tables, you're good to go! ✅

---

## Step 4: Verify Database Connection

### 4.1 Check Table Structure

1. Click on each table to verify columns:

**users table:**
- shop (text)
- plan (text)
- message_count (integer)
- access_token (text)
- api_key (text)
- widget_color (text)
- widget_position (text)
- created_at (timestamp)

**leads table:**
- id (integer)
- shop (text)
- name (text)
- email (text)
- phone (text)
- message_context (text)
- created_at (timestamp)

**chat_memory table:**
- id (integer)
- shop (text)
- session_id (text)
- messages (jsonb)
- created_at (timestamp)

**products table:**
- id (integer)
- shop (text)
- product_id (text)
- title (text)
- description (text)
- price (text)
- image_url (text)
- created_at (timestamp)

**interactions table:**
- id (integer)
- shop (text)
- session_id (text)
- event_type (text)
- event_data (jsonb)
- created_at (timestamp)

### 4.2 Test Query

1. Click **SQL Editor**
2. Click **New Query**
3. Paste this test query:
   ```sql
   SELECT COUNT(*) as table_count FROM information_schema.tables 
   WHERE table_schema = 'public';
   ```
4. Click **Run**
5. You should see `table_count: 5`

---

## Step 5: Configure Security (Optional but Recommended)

### 5.1 Enable Row Level Security

1. Go to **Authentication** (left sidebar)
2. Click **Policies**
3. For each table, you can set up Row Level Security
4. This restricts data access by shop domain

### 5.2 Set Up API Keys

1. Go to **Settings** → **API**
2. You already have the `anon` key
3. For production, consider creating a `service_role` key
4. Keep both keys safe

---

## Troubleshooting

### Issue: "Project creation failed"
**Solution:**
- Check your internet connection
- Try again in a few minutes
- Check Supabase status page

### Issue: "SQL execution failed"
**Solution:**
- Check for syntax errors in migrations.sql
- Verify you copied all the SQL
- Try running queries one at a time
- Check Supabase logs

### Issue: "Tables not appearing"
**Solution:**
- Refresh the page
- Check SQL execution completed successfully
- Verify no errors in SQL editor

### Issue: "Cannot connect from app"
**Solution:**
- Verify `SUPABASE_URL` is correct
- Verify `SUPABASE_KEY` is correct
- Check your internet connection
- Verify Supabase project is running

---

## Next Steps

After Supabase is set up:

1. **Save your credentials** - You'll need them for Render
2. **Deploy to Render** - Follow RENDER_SETUP.md
3. **Configure Shopify** - Update redirect URI
4. **Test the app** - Send test messages

---

## Quick Reference

| Item | Where to Find |
|------|---------------|
| Project URL | Settings → API → Project URL |
| API Key | Settings → API → anon public |
| SQL Editor | Left sidebar → SQL Editor |
| Table Editor | Left sidebar → Table Editor |
| Database Status | Settings → Database |
| Logs | Settings → Logs |

---

## Support

- **Supabase Docs**: https://supabase.com/docs
- **Supabase Community**: https://discord.supabase.io
- **SQL Reference**: https://www.postgresql.org/docs/

---

**Supabase setup complete! Ready to deploy to Render. 🚀**
