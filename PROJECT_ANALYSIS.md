# AI Sales Agent - Project Analysis & Development Plan

## Current Architecture

### Backend (Node.js + Express)
- **Server:** Express.js on port 3000
- **Database:** Supabase (PostgreSQL)
- **AI Model:** OpenAI GPT-4o-mini
- **Hosting:** Render (free tier)

### Database Schema (Inferred from Code)

#### `users` table
- `shop` (string, primary key) - Shopify store domain
- `plan` (string) - "free" or "paid"
- `message_count` (integer) - Chat messages used
- `access_token` (string) - Shopify OAuth token

#### `leads` table
- `shop` (string) - Shopify store domain
- `name` (string, nullable)
- `email` (string, nullable)
- `phone` (string, nullable)
- `created_at` (timestamp)

#### `chat_memory` table
- `session_id` (string) - User session ID
- `message` (string) - Chat message content
- `created_at` (timestamp)

#### `products` table
- `shop` (string)
- `title` (string)
- `description` (string)
- `price` (decimal)

### API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/chat` | Send message to AI chatbot |
| GET | `/widget.js` | Serve chat widget script |
| GET | `/install` | Shopify OAuth flow start |
| GET | `/auth/callback` | Shopify OAuth callback |
| POST | `/install-script` | Inject widget into storefront |
| GET | `/create-charge` | Initiate billing flow |
| GET | `/confirm-charge` | Confirm payment |

### Frontend (Script Injection)
- **widget.js** - Injected into Shopify storefronts
- Simple chat UI (300px fixed widget)
- Session ID: hardcoded "shopify-user" (NEEDS FIX)

## Missing Features (High Priority)

### 1. Admin Dashboard
- [ ] Store owner login/authentication
- [ ] Dashboard layout with sidebar navigation
- [ ] Leads management page
  - [ ] View all captured leads
  - [ ] Export leads (CSV)
  - [ ] Lead details view
- [ ] Analytics page
  - [ ] Chat volume metrics
  - [ ] Conversion rate tracking
  - [ ] Revenue tracking
  - [ ] Charts and visualizations
- [ ] Settings page
  - [ ] Plan management
  - [ ] Store configuration
  - [ ] API key management

### 2. Improved Chatbot UX
- [ ] Better conversation flow
- [ ] Context-aware product recommendations
- [ ] Fallback responses when products don't match
- [ ] Sentiment analysis to detect purchase intent
- [ ] Follow-up suggestions

### 3. Conversion Tracking
- [ ] Track user interactions (clicks, product views)
- [ ] Track checkout events
- [ ] Calculate conversion rate
- [ ] Track revenue attribution

### 4. Store Owner Onboarding
- [ ] Welcome flow after app installation
- [ ] Product sync verification
- [ ] Test chat functionality
- [ ] Settings wizard

### 5. Chat Widget Improvements
- [ ] Better UI/UX design
- [ ] Proper session management (use shop domain)
- [ ] Typing indicators
- [ ] Message history persistence
- [ ] Mobile-responsive design

## Technical Debt

1. **Session ID Issue** - Using hardcoded "shopify-user" instead of shop domain
2. **No Authentication** - Admin dashboard needs proper auth
3. **No Error Handling** - Limited error messages and logging
4. **No Rate Limiting** - API endpoints not rate-limited
5. **No Input Validation** - Minimal validation on inputs

## Next Steps

1. Create Admin Dashboard with React
2. Add authentication middleware to backend
3. Create new API endpoints for dashboard
4. Improve chat widget with better UX
5. Add conversion tracking
6. Deploy to Render
