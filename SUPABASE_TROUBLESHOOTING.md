# Supabase Connection Troubleshooting & Setup

Complete guide to troubleshoot and set up Supabase database connection.

## Issue: Supabase MCP Connector Error

### What Happened

When trying to connect via the Supabase MCP (Model Context Protocol) connector, we encountered:
```
Failed to parse Supabase Content API response: Invalid input
```

### Root Cause

The Supabase MCP connector has limitations with certain API responses. This is a known issue with the connector interface, not your Supabase account.

### Solution

We've created alternative methods to set up your database:

---

## Method 1: Manual Setup (Recommended - 10 minutes)

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign in or create account
3. Click **"New Project"**
4. Fill in:
   - **Project name**: `ai-sales-agent`
   - **Database password**: Create strong password (save it!)
   - **Region**: Singapore (or closest to you)
5. Click **"Create new project"**
6. Wait 2-3 minutes for setup

### Step 2: Get Your Credentials

1. Go to **Settings** → **API**
2. Copy:
   - **Project URL** → Save as `SUPABASE_URL`
   - **anon public** key → Save as `SUPABASE_KEY`

Example:
```
SUPABASE_URL=https://abcdefghijklmnop.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Step 3: Run Database Migrations

1. In Supabase dashboard, click **SQL Editor** (left sidebar)
2. Click **New Query**
3. Open `migrations.sql` from your repository
4. Copy **all** SQL code
5. Paste into Supabase SQL editor
6. Click **Run**
7. Wait for "Success" message

### Step 4: Verify Tables Created

1. Click **Table Editor** (left sidebar)
2. Verify these 5 tables exist:
   - ✅ users
   - ✅ leads
   - ✅ chat_memory
   - ✅ products
   - ✅ interactions

**Done!** Your database is ready. ✅

---

## Method 2: Python Setup Script

### Prerequisites

- Python 3.7+
- `requests` library (install: `pip install requests`)
- Your Supabase credentials

### Step 1: Set Environment Variables

**On Mac/Linux:**
```bash
export SUPABASE_URL=https://your-project.supabase.co
export SUPABASE_KEY=your_anon_key_here
```

**On Windows (PowerShell):**
```powershell
$env:SUPABASE_URL="https://your-project.supabase.co"
$env:SUPABASE_KEY="your_anon_key_here"
```

### Step 2: Run the Setup Script

```bash
python3 supabase_setup.py
```

### What the Script Does

1. ✅ Tests Supabase connection
2. ✅ Displays SQL migrations
3. ✅ Checks for existing tables
4. ✅ Provides next steps

### Script Output

```
============================================================
Supabase Database Setup
============================================================

📍 Supabase URL: https://your-project.supabase.co
🔑 API Key: eyJhbGciOiJIUzI1NiIs...

🔗 Testing Supabase connection...
✅ Connection successful!

⚠️  Note: Supabase REST API doesn't support direct SQL execution.
📝 Please run the SQL migrations manually in Supabase dashboard:

1. Go to https://app.supabase.com
2. Select your project
3. Click 'SQL Editor' in the left sidebar
4. Click 'New Query'
5. Copy and paste the SQL below
6. Click 'Run'

============================================================
SQL MIGRATION:
============================================================
[SQL code here...]
============================================================
```

---

## Method 3: Direct Supabase CLI

### Prerequisites

- Supabase CLI installed: `npm install -g supabase`
- Your Supabase credentials

### Step 1: Login to Supabase

```bash
supabase login
```

### Step 2: Link Your Project

```bash
supabase link --project-ref your-project-id
```

### Step 3: Run Migrations

```bash
supabase db push
```

---

## Troubleshooting Common Issues

### Issue 1: "Invalid API Key"

**Solution:**
- Go to Supabase Settings → API
- Copy the **anon public** key (not the service_role key)
- Verify no extra spaces or characters
- Try again

### Issue 2: "Connection Timeout"

**Solution:**
- Check your internet connection
- Verify Supabase project is running (check dashboard)
- Try a different region
- Wait a few minutes and retry

### Issue 3: "SQL Syntax Error"

**Solution:**
- Verify you copied all SQL from `migrations.sql`
- Check for incomplete queries
- Try running queries one at a time
- Check Supabase SQL editor logs

### Issue 4: "Tables Not Appearing"

**Solution:**
- Refresh the page
- Verify SQL execution completed successfully
- Check for error messages in SQL editor
- Verify you're in the correct project

### Issue 5: "Cannot Connect from App"

**Solution:**
- Verify `SUPABASE_URL` is correct
- Verify `SUPABASE_KEY` is correct
- Check internet connection
- Verify Supabase project status
- Try testing connection with Python script

---

## Verification Checklist

After setup, verify:

- [ ] Supabase project created
- [ ] Credentials saved (SUPABASE_URL, SUPABASE_KEY)
- [ ] SQL migrations executed successfully
- [ ] All 5 tables exist:
  - [ ] users
  - [ ] leads
  - [ ] chat_memory
  - [ ] products
  - [ ] interactions
- [ ] Connection test passed
- [ ] No error messages in logs

---

## Next Steps

After Supabase is set up:

1. **Save your credentials** - You'll need them for Render
2. **Deploy to Render** - Follow RENDER_SETUP.md
3. **Configure Shopify** - Update redirect URI
4. **Test the app** - Send test messages

---

## Quick Reference

| Task | Steps |
|------|-------|
| Create Project | supabase.com → New Project → Fill form → Create |
| Get Credentials | Settings → API → Copy URL & Key |
| Run Migrations | SQL Editor → New Query → Paste SQL → Run |
| Verify Tables | Table Editor → Check 5 tables exist |
| Test Connection | `python3 supabase_setup.py` |

---

## Support Resources

- **Supabase Docs**: https://supabase.com/docs
- **Supabase Dashboard**: https://app.supabase.com
- **SQL Reference**: https://www.postgresql.org/docs/
- **Community**: https://discord.supabase.io

---

## Why We Use These Methods

**MCP Connector Issue:**
- The Supabase MCP connector has limitations with API response parsing
- This is a known limitation, not a problem with your account
- Alternative methods work reliably

**Manual Method:**
- Most reliable and straightforward
- Gives you full control and visibility
- Best for understanding your database

**Python Script:**
- Automated testing and verification
- Good for CI/CD pipelines
- Provides clear feedback

**Supabase CLI:**
- Professional approach
- Integrates with version control
- Supports multiple environments

---

## Success Indicators

Your setup is successful when:

✅ Supabase project is created
✅ All credentials are saved
✅ SQL migrations executed without errors
✅ All 5 tables appear in Table Editor
✅ Connection test passes
✅ No error messages in logs

---

**Your Supabase database is ready! 🚀**

Proceed to RENDER_SETUP.md for deployment.
