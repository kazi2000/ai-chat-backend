# AI Sales Agent for Shopify

An intelligent, conversion-focused AI sales assistant that integrates directly into Shopify storefronts. The app uses OpenAI's GPT-4o-mini to provide real-time product recommendations, capture leads, and increase conversions through conversational commerce.

## Features

### Core Functionality
- **AI-Powered Chat Widget** - Intelligent product recommendations based on customer needs
- **Lead Capture System** - Automatically extracts customer names, emails, and phone numbers from conversations
- **Product Sync** - Automatically syncs products from Shopify catalog
- **Chat Memory** - Maintains conversation context for personalized recommendations
- **Billing Integration** - Free tier (50 messages) and Pro tier ($19/month unlimited)

### Admin Dashboard (Coming Soon)
- View and manage all captured leads
- Analytics dashboard with conversion metrics
- Export leads as CSV
- Store settings and customization
- API key management

## Tech Stack

| Component | Technology |
|-----------|------------|
| Backend | Node.js + Express |
| Database | Supabase (PostgreSQL) |
| AI | OpenAI GPT-4o-mini |
| Frontend Widget | Vanilla JavaScript |
| Hosting | Render |

## Installation

### Prerequisites
- Node.js 16+
- npm or yarn
- Shopify Partner account with app credentials
- Supabase project
- OpenAI API key

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/kazi2000/ai-chat-backend.git
   cd ai-chat-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Fill in your credentials:
   - `SHOPIFY_API_KEY` - From Shopify Partner Dashboard
   - `SHOPIFY_API_SECRET` - From Shopify Partner Dashboard
   - `SUPABASE_URL` - Your Supabase project URL
   - `SUPABASE_KEY` - Your Supabase anon key
   - `OPENAI_API_KEY` - Your OpenAI API key

4. **Set up Supabase database**
   - Run the SQL migrations from `migrations.sql` in your Supabase SQL editor
   - This creates all necessary tables and indexes

5. **Deploy to Render**
   - Connect your GitHub repository to Render
   - Set environment variables in Render dashboard
   - Deploy the main branch

6. **Configure Shopify App**
   - Go to your Shopify Partner Dashboard
   - Set the app URL to your Render deployment URL
   - Set redirect URI to `{APP_URL}/auth/callback`
   - Scopes needed: `read_products`, `write_script_tags`, `read_script_tags`

## API Endpoints

### Chat API
```
POST /chat
Body: {
  message: string,
  sessionId: string,
  shop: string
}
Response: { reply: string }
```

### Admin Dashboard API

**Get Analytics**
```
GET /api/admin/analytics?days=30&shop={shop}
Response: {
  metrics: { totalLeads, totalChats, conversionRate, ... },
  leadsOverTime: { date: count, ... },
  chatsOverTime: { date: count, ... }
}
```

**Get Leads**
```
GET /api/admin/leads?page=1&limit=20&shop={shop}
Response: {
  leads: [...],
  pagination: { page, limit, total, pages }
}
```

**Export Leads**
```
GET /api/admin/leads/export?shop={shop}
Response: CSV file download
```

**Get Settings**
```
GET /api/admin/settings?shop={shop}
Response: { shop, plan, messagesUsed, messagesLimit, ... }
```

**Update Settings**
```
POST /api/admin/settings?shop={shop}
Body: { widgetColor: string, widgetPosition: string }
Response: { success: true, data: {...} }
```

## Widget Integration

The chat widget is automatically injected into your Shopify store after app installation. It appears as a floating button in the bottom-right corner of your storefront.

### Widget Features
- Responsive design (mobile-friendly)
- Persistent session management
- Typing indicators
- Smooth animations
- Customizable colors and position

### Widget Configuration
The widget can be customized via the admin dashboard:
- `widgetColor` - Primary color (default: #667eea)
- `widgetPosition` - Position on screen (default: bottom-right)

## Database Schema

### users
Stores Shopify store information and subscription details.

| Column | Type | Description |
|--------|------|-------------|
| shop | TEXT | Shopify store domain (primary key) |
| plan | TEXT | "free" or "paid" |
| message_count | INTEGER | Chat messages used |
| access_token | TEXT | Shopify OAuth token |
| api_key | TEXT | Unique API key for store |
| widget_color | TEXT | Widget color preference |
| widget_position | TEXT | Widget position preference |

### leads
Captured customer information from conversations.

| Column | Type | Description |
|--------|------|-------------|
| id | BIGSERIAL | Primary key |
| shop | TEXT | Reference to users.shop |
| name | TEXT | Customer name |
| email | TEXT | Customer email |
| phone | TEXT | Customer phone |
| message_context | TEXT | Conversation context |
| created_at | TIMESTAMP | Creation timestamp |

### chat_memory
Conversation history for context.

| Column | Type | Description |
|--------|------|-------------|
| id | BIGSERIAL | Primary key |
| session_id | TEXT | User session ID |
| message | TEXT | Chat message |
| created_at | TIMESTAMP | Creation timestamp |

### products
Synced Shopify products.

| Column | Type | Description |
|--------|------|-------------|
| id | BIGSERIAL | Primary key |
| shop | TEXT | Reference to users.shop |
| shopify_id | TEXT | Shopify product ID |
| title | TEXT | Product name |
| description | TEXT | Product description |
| price | DECIMAL | Product price |
| image_url | TEXT | Product image URL |

### interactions
User interaction tracking for analytics.

| Column | Type | Description |
|--------|------|-------------|
| id | BIGSERIAL | Primary key |
| shop | TEXT | Reference to users.shop |
| session_id | TEXT | User session ID |
| type | TEXT | "chat", "click", "view", "purchase" |
| data | JSONB | Additional interaction data |
| created_at | TIMESTAMP | Creation timestamp |

## Development

### Local Development
```bash
npm start
# Server runs on http://localhost:3000
```

### Testing the Chat API
```bash
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "I need a blue shirt",
    "sessionId": "test-session",
    "shop": "test-shop.myshopify.com"
  }'
```

## Deployment

### Deploy to Render
1. Connect GitHub repository to Render
2. Set environment variables
3. Deploy main branch
4. Update Shopify app URL to Render deployment URL

### Environment Variables on Render
- `SHOPIFY_API_KEY`
- `SHOPIFY_API_SECRET`
- `SUPABASE_URL`
- `SUPABASE_KEY`
- `OPENAI_API_KEY`
- `APP_URL` (your Render URL)
- `NODE_ENV=production`

## Pricing

| Plan | Price | Features |
|------|-------|----------|
| Free | $0 | 50 messages/month |
| Pro | $19/month | Unlimited messages |

## Roadmap

- [ ] Admin dashboard with React UI
- [ ] Multi-language support
- [ ] Email/WhatsApp follow-up integration
- [ ] Advanced analytics and reporting
- [ ] Custom AI personality settings
- [ ] A/B testing for product recommendations
- [ ] Integration with Shopify Checkout Extensions

## Troubleshooting

### Widget not appearing on storefront
1. Check that app is installed (OAuth callback completed)
2. Verify script tag was created in Shopify admin
3. Check browser console for JavaScript errors
4. Ensure `APP_URL` environment variable is correct

### Chat not responding
1. Verify OpenAI API key is valid
2. Check Supabase connection and database tables
3. Review server logs for errors
4. Ensure message count is within plan limits

### Products not syncing
1. Check Shopify access token is valid
2. Verify products exist in Shopify admin
3. Check Supabase products table for entries
4. Review server logs for sync errors

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review server logs on Render dashboard
3. Check Supabase database for data integrity
4. Open an issue on GitHub

## License

MIT

## Author

Built with ❤️ for Shopify store owners
