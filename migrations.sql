-- AI Sales Agent Database Schema

-- Users table
CREATE TABLE IF NOT EXISTS users (
  shop TEXT PRIMARY KEY,
  plan TEXT DEFAULT 'free',
  message_count INTEGER DEFAULT 0,
  access_token TEXT,
  api_key TEXT UNIQUE,
  widget_color TEXT DEFAULT '#667eea',
  widget_position TEXT DEFAULT 'bottom-right',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Leads table
CREATE TABLE IF NOT EXISTS leads (
  id BIGSERIAL PRIMARY KEY,
  shop TEXT NOT NULL REFERENCES users(shop) ON DELETE CASCADE,
  name TEXT,
  email TEXT,
  phone TEXT,
  message_context TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Chat memory table
CREATE TABLE IF NOT EXISTS chat_memory (
  id BIGSERIAL PRIMARY KEY,
  session_id TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id BIGSERIAL PRIMARY KEY,
  shop TEXT NOT NULL REFERENCES users(shop) ON DELETE CASCADE,
  shopify_id TEXT,
  title TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2),
  image_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Interactions table (for tracking user behavior)
CREATE TABLE IF NOT EXISTS interactions (
  id BIGSERIAL PRIMARY KEY,
  shop TEXT NOT NULL REFERENCES users(shop) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  type TEXT NOT NULL, -- 'chat', 'click', 'view', 'purchase'
  data JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_leads_shop ON leads(shop);
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at);
CREATE INDEX IF NOT EXISTS idx_chat_memory_session ON chat_memory(session_id);
CREATE INDEX IF NOT EXISTS idx_products_shop ON products(shop);
CREATE INDEX IF NOT EXISTS idx_interactions_shop ON interactions(shop);
CREATE INDEX IF NOT EXISTS idx_interactions_session ON interactions(session_id);
CREATE INDEX IF NOT EXISTS idx_interactions_created_at ON interactions(created_at);

-- Enable Row Level Security (optional but recommended)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE interactions ENABLE ROW LEVEL SECURITY;
