# API Documentation - AI Sales Agent

Complete API reference for the AI Sales Agent backend.

## Base URL

```
https://ai-chat-backend-c3y7.onrender.com
```

## Authentication

Most endpoints require the `shop` parameter to identify the store. For admin endpoints, ensure the request comes from an authorized source.

## Chat API

### Send Message

Send a message to the AI chatbot and receive a response.

```
POST /chat
```

**Request Body:**
```json
{
  "message": "I'm looking for a blue shirt",
  "sessionId": "session_123456",
  "shop": "mystore.myshopify.com"
}
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| message | string | Yes | Customer message |
| sessionId | string | Yes | Unique session identifier |
| shop | string | Yes | Shopify store domain |

**Response:**
```json
{
  "reply": "Great! We have several blue shirts in stock. What size are you looking for?"
}
```

**Status Codes:**
- `200` - Success
- `400` - Missing required parameters
- `404` - Store not found
- `500` - Server error

---

## Admin Dashboard API

### Get Analytics

Retrieve store analytics and metrics.

```
GET /api/admin/analytics?shop={shop}&days={days}
```

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| shop | string | Yes | - | Shopify store domain |
| days | integer | No | 30 | Number of days to analyze |

**Response:**
```json
{
  "store": "mystore.myshopify.com",
  "metrics": {
    "totalLeads": 45,
    "totalChats": 150,
    "leadsWithEmail": 32,
    "leadsWithPhone": 18,
    "conversionRate": "30.00%",
    "messagesUsed": 120,
    "plan": "free"
  },
  "leadsOverTime": {
    "2024-04-01": 5,
    "2024-04-02": 8
  }
}
```

---

### Get Leads

Retrieve paginated list of captured leads.

```
GET /api/admin/leads?shop={shop}&page={page}&limit={limit}
```

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| shop | string | Yes | - | Shopify store domain |
| page | integer | No | 1 | Page number |
| limit | integer | No | 20 | Results per page |

**Response:**
```json
{
  "leads": [
    {
      "id": 1,
      "shop": "mystore.myshopify.com",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "555-0123",
      "created_at": "2024-04-01T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "pages": 3
  }
}
```

---

### Export Leads

Export leads as CSV file.

```
GET /api/admin/leads/export?shop={shop}
```

**Response:** CSV file download

---

### Get Settings

Retrieve store settings and configuration.

```
GET /api/admin/settings?shop={shop}
```

**Response:**
```json
{
  "shop": "mystore.myshopify.com",
  "plan": "free",
  "messagesUsed": 120,
  "messagesLimit": 50,
  "installedAt": "2024-03-15T08:00:00Z",
  "apiKey": "abc123def456..."
}
```

---

### Update Settings

Update store settings and configuration.

```
POST /api/admin/settings?shop={shop}
```

**Request Body:**
```json
{
  "widgetColor": "#667eea",
  "widgetPosition": "bottom-right"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "shop": "mystore.myshopify.com",
    "widget_color": "#667eea",
    "widget_position": "bottom-right"
  }
}
```

---

## Shopify Integration Endpoints

### Install App

Start Shopify OAuth flow.

```
GET /install?shop={shop}
```

**Response:** Redirects to Shopify OAuth authorization page.

---

### Auth Callback

Shopify OAuth callback endpoint.

```
GET /auth/callback?shop={shop}&code={code}
```

**Response:** HTML page confirming successful installation.

---

### Create Charge

Initiate billing flow for Pro plan upgrade.

```
GET /create-charge?shop={shop}
```

**Response:** Redirects to Shopify billing confirmation page.

---

### Confirm Charge

Confirm payment and activate Pro plan.

```
GET /confirm-charge?shop={shop}
```

**Response:** HTML page confirming payment success.

---

## Error Responses

All error responses follow this format:

```json
{
  "error": "Error message describing what went wrong"
}
```

### Common Error Codes

| Status | Error | Cause |
|--------|-------|-------|
| 400 | Missing required parameters | Required parameter not provided |
| 404 | Store not found | Shop not installed |
| 500 | Server error | Internal server error |

---

## Integration Examples

### JavaScript (Fetch)

```javascript
const response = await fetch('https://ai-chat-backend-c3y7.onrender.com/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: 'What products do you have?',
    sessionId: 'user_123',
    shop: 'mystore.myshopify.com'
  })
});

const data = await response.json();
console.log(data.reply);
```

### Python (Requests)

```python
import requests

response = requests.post(
    'https://ai-chat-backend-c3y7.onrender.com/chat',
    json={
        'message': 'What products do you have?',
        'sessionId': 'user_123',
        'shop': 'mystore.myshopify.com'
    }
)

print(response.json()['reply'])
```

### cURL

```bash
curl -X POST https://ai-chat-backend-c3y7.onrender.com/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What products do you have?",
    "sessionId": "user_123",
    "shop": "mystore.myshopify.com"
  }'
```

---

## Support

For API issues or questions, check this documentation or review server logs.
