import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";
import fetch from "node-fetch";
import globalFetch from "node-fetch";
if (!global.fetch) global.fetch = fetch;
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// =============================
// MIDDLEWARE
// =============================

// Verify Shopify request
const verifyShopifyRequest = (req, res, next) => {
  const shop = req.query.shop || req.body.shop;
  if (!shop) {
    return res.status(400).json({ error: "Missing shop parameter" });
  }
  req.shop = shop;
  next();
};

// =============================
// CHAT API (IMPROVED)
// =============================
app.post("/chat", async (req, res) => {
  try {
    const { message, sessionId, shop } = req.body;
    
    if (!sessionId || !shop) {
      return res.status(400).json({ error: "Missing sessionId or shop" });
    }

    // Lead extraction (improved regex)
    const emailRegex = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;
    const phoneRegex = /\b(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})\b/;
    const nameRegex = /(?:my name is|i'm|i am|call me)\s+([A-Za-z\s]+)/i;

    let email = message.match(emailRegex)?.[0] || null;
    let phone = message.match(phoneRegex)?.[0] || null;
    let name = message.match(nameRegex)?.[1]?.trim() || null;

    // Save lead if at least one field exists
    if (email || phone || name) {
      await supabase.from("leads").insert({
        shop,
        name,
        email,
        phone,
        message_context: message.substring(0, 500)
      });
    }

    // Get user
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("shop", shop)
      .single();

    if (userError || !user) {
      return res.status(404).json({ error: "Store not found" });
    }

    // Free plan limit
    if (user.plan === "free" && user.message_count >= 50) {
      return res.json({
        reply: `⚠️ You've reached your free limit of 50 messages.\nUpgrade to Pro for unlimited conversations: https://ai-chat-backend-c3y7.onrender.com/create-charge?shop=${shop}`
      });
    }

    // Get chat memory (last 10 messages for context)
    const { data: memory } = await supabase
      .from("chat_memory")
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: false })
      .limit(10);

    const context = memory?.reverse()?.map(m => m.message).join("\n") || "";

    // Get products
    const { data: products } = await supabase
      .from("products")
      .select("title, description, price")
      .eq("shop", shop)
      .limit(20);

    const productContext = products?.length
      ? products
          .map((p) => `- ${p.title}: ${p.description} ($${p.price})`)
          .join("\n")
      : "No products available.";

    // IMPROVED AI PROMPT - Better product recommendations
    const systemPrompt = `You are an expert AI sales assistant for an ecommerce store. Your primary goal is to increase conversions through personalized, helpful conversations.

Guidelines:
1. Understand the customer's needs through smart questions
2. Recommend ONLY the most relevant products (max 2-3)
3. Be conversational and friendly, never pushy
4. If the customer seems interested, ask for their email to send product details
5. If they're not ready to buy, offer to follow up later
6. Use product details to provide specific benefits

Available Products:
${productContext}

Remember: Quality over quantity. One perfect recommendation beats listing everything.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: `${context}\nCustomer: ${message}`
        }
      ],
      temperature: 0.7,
      max_tokens: 300
    });

    let reply = response.choices[0].message.content;

    // Add remaining message count for free users
    if (user.plan === "free") {
      const remaining = 50 - (user.message_count + 1);
      reply += `\n\n_${remaining} free messages remaining_`;
    }

    // Save to chat memory
    await supabase.from("chat_memory").insert([
      { session_id: sessionId, message: `Customer: ${message}` },
      { session_id: sessionId, message: `AI: ${reply}` }
    ]);

    // Update message count
    await supabase
      .from("users")
      .update({ message_count: user.message_count + 1 })
      .eq("shop", shop);

    // Track interaction
    await supabase.from("interactions").insert({
      shop,
      session_id: sessionId,
      type: "chat",
      data: { message_length: message.length, has_lead_info: !!(email || phone || name) }
    });

    res.json({ reply });

  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({ error: "Chat processing failed" });
  }
});

// =============================
// ADMIN DASHBOARD API
// =============================

// Get store analytics
app.get("/api/admin/analytics", verifyShopifyRequest, async (req, res) => {
  try {
    const { shop } = req;
    const days = parseInt(req.query.days) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get leads count
    const { data: leads, error: leadsError } = await supabase
      .from("leads")
      .select("*")
      .eq("shop", shop)
      .gte("created_at", startDate.toISOString());

    // Get chat interactions
    const { data: interactions, error: interactionsError } = await supabase
      .from("interactions")
      .select("*")
      .eq("shop", shop)
      .gte("created_at", startDate.toISOString());

    // Get user info
    const { data: user } = await supabase
      .from("users")
      .select("*")
      .eq("shop", shop)
      .single();

    // Calculate metrics
    const totalLeads = leads?.length || 0;
    const totalChats = interactions?.filter(i => i.type === "chat").length || 0;
    const leadsWithEmail = leads?.filter(l => l.email).length || 0;
    const leadsWithPhone = leads?.filter(l => l.phone).length || 0;
    const conversionRate = totalChats > 0 ? ((totalLeads / totalChats) * 100).toFixed(2) : 0;

    res.json({
      store: shop,
      period: { days, startDate },
      metrics: {
        totalLeads,
        totalChats,
        leadsWithEmail,
        leadsWithPhone,
        conversionRate: `${conversionRate}%`,
        messagesUsed: user?.message_count || 0,
        plan: user?.plan || "free"
      },
      leadsOverTime: groupByDate(leads || []),
      chatsOverTime: groupByDate(interactions || [])
    });

  } catch (error) {
    console.error("Analytics error:", error);
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
});

// Get leads list
app.get("/api/admin/leads", verifyShopifyRequest, async (req, res) => {
  try {
    const { shop } = req;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const { data: leads, error } = await supabase
      .from("leads")
      .select("*")
      .eq("shop", shop)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    const { count } = await supabase
      .from("leads")
      .select("*", { count: "exact", head: true })
      .eq("shop", shop);

    res.json({
      leads: leads || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit)
      }
    });

  } catch (error) {
    console.error("Leads fetch error:", error);
    res.status(500).json({ error: "Failed to fetch leads" });
  }
});

// Export leads as CSV
app.get("/api/admin/leads/export", verifyShopifyRequest, async (req, res) => {
  try {
    const { shop } = req;

    const { data: leads } = await supabase
      .from("leads")
      .select("*")
      .eq("shop", shop)
      .order("created_at", { ascending: false });

    if (!leads || leads.length === 0) {
      return res.json({ csv: "name,email,phone,date\n" });
    }

    // Convert to CSV
    const csv = [
      "name,email,phone,date",
      ...leads.map(l => `"${l.name || ''}","${l.email || ''}","${l.phone || ''}","${l.created_at}"`)
    ].join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="leads-${shop}-${new Date().toISOString().split('T')[0]}.csv"`);
    res.send(csv);

  } catch (error) {
    console.error("Export error:", error);
    res.status(500).json({ error: "Failed to export leads" });
  }
});

// Get store settings
app.get("/api/admin/settings", verifyShopifyRequest, async (req, res) => {
  try {
    const { shop } = req;

    const { data: user } = await supabase
      .from("users")
      .select("*")
      .eq("shop", shop)
      .single();

    res.json({
      shop,
      plan: user?.plan || "free",
      messagesUsed: user?.message_count || 0,
      messagesLimit: user?.plan === "free" ? 50 : "unlimited",
      installedAt: user?.created_at,
      apiKey: user?.api_key || null
    });

  } catch (error) {
    console.error("Settings error:", error);
    res.status(500).json({ error: "Failed to fetch settings" });
  }
});

// Update store settings
app.post("/api/admin/settings", verifyShopifyRequest, async (req, res) => {
  try {
    const { shop } = req;
    const { widgetColor, widgetPosition } = req.body;

    const { data } = await supabase
      .from("users")
      .update({
        widget_color: widgetColor,
        widget_position: widgetPosition
      })
      .eq("shop", shop)
      .select();

    res.json({ success: true, data });

  } catch (error) {
    console.error("Settings update error:", error);
    res.status(500).json({ error: "Failed to update settings" });
  }
});

// =============================
// SERVE WIDGET
// =============================
app.get("/widget.js", (req, res) => {
  res.sendFile(path.join(__dirname, "widget.js"));
});

app.get("/admin.html", (req, res) => {
  res.sendFile(path.join(__dirname, "admin.html"));
});

// =============================
// INSTALL APP
// =============================
app.get("/install", (req, res) => {
  const shop = req.query.shop;

  if (!shop) {
    return res.status(400).send("Missing shop parameter");
  }

  const apiKey = process.env.SHOPIFY_API_KEY;
  const redirectUri = `${process.env.APP_URL || "https://ai-chat-backend-c3y7.onrender.com"}/auth/callback`;

  const installUrl = `https://${shop}/admin/oauth/authorize?client_id=${apiKey}&scope=read_products,write_script_tags,read_script_tags&redirect_uri=${redirectUri}&grant_options[]=per-user`;

  res.redirect(installUrl);
});

// =============================
// AUTH CALLBACK
// =============================
app.get("/auth/callback", async (req, res) => {
  const { shop, code } = req.query;

  if (!shop || !code) {
    return res.status(400).send("Missing shop or code");
  }

  try {
    const tokenRes = await fetch(`https://${shop}/admin/oauth/access_token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        client_id: process.env.SHOPIFY_API_KEY,
        client_secret: process.env.SHOPIFY_API_SECRET,
        code
      })
    });

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      return res.status(400).send("Failed to get access token");
    }

    // Fetch products from Shopify
    const productRes = await fetch(`https://${shop}/admin/api/2024-01/products.json`, {
      method: "GET",
      headers: {
        "X-Shopify-Access-Token": accessToken,
        "Content-Type": "application/json"
      }
    });

    const productData = await productRes.json();
    const products = productData.products || [];

    // Save user
    const apiKey = crypto.randomBytes(16).toString("hex");
    await supabase.from("users").upsert({
      shop,
      plan: "free",
      message_count: 0,
      access_token: accessToken,
      api_key: apiKey,
      created_at: new Date().toISOString()
    });

    // Save products
    if (products.length > 0) {
      const productsToSave = products.map(p => ({
        shop,
        shopify_id: p.id,
        title: p.title,
        description: p.body_html?.substring(0, 500) || "",
        price: p.variants?.[0]?.price || 0
      }));

      await supabase.from("products").upsert(productsToSave);
    }

    // Install widget script
    await fetch(`${process.env.APP_URL || "https://ai-chat-backend-c3y7.onrender.com"}/install-script`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        shop,
        accessToken
      })
    });

    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>App Installation</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; text-align: center; padding: 40px; }
          .success { color: #10b981; font-size: 24px; margin-bottom: 20px; }
          .info { color: #666; margin-bottom: 10px; }
          a { color: #0066cc; text-decoration: none; }
        </style>
      </head>
      <body>
        <div class="success">✅ App Installed Successfully!</div>
        <p class="info">Your AI Sales Agent is now active on your store.</p>
        <p class="info">Synced ${products.length} products from your catalog.</p>
        <p class="info"><a href="https://${shop}/admin">Return to Shopify Admin</a></p>
      </body>
      </html>
    `);

  } catch (error) {
    console.error("Auth error:", error);
    res.status(500).send("Authentication failed. Please try installing again.");
  }
});

// =============================
// INSTALL SCRIPT TO SHOPIFY
// =============================
app.post("/install-script", async (req, res) => {
  const { shop, accessToken } = req.body;

  if (!shop || !accessToken) {
    return res.status(400).json({ error: "Missing shop or accessToken" });
  }

  try {
    const widgetUrl = `${process.env.APP_URL || "https://ai-chat-backend-c3y7.onrender.com"}/widget.js?shop=${shop}`;

    const response = await fetch(`https://${shop}/admin/api/2024-01/script_tags.json`, {
      method: "POST",
      headers: {
        "X-Shopify-Access-Token": accessToken,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        script_tag: {
          event: "onload",
          src: widgetUrl
        }
      })
    });

    const data = await response.json();
    res.json(data);

  } catch (error) {
    console.error("Script installation error:", error);
    res.status(500).json({ error: "Failed to install script" });
  }
});

// =============================
// CREATE CHARGE (PAID PLAN)
// =============================
app.get("/create-charge", async (req, res) => {
  const shop = req.query.shop;

  if (!shop) {
    return res.status(400).send("Missing shop parameter");
  }

  try {
    const { data: user } = await supabase
      .from("users")
      .select("*")
      .eq("shop", shop)
      .single();

    if (!user || !user.access_token) {
      return res.send("❌ No access token found");
    }

    const response = await fetch(`https://${shop}/admin/api/2024-01/graphql.json`, {
      method: "POST",
      headers: {
        "X-Shopify-Access-Token": user.access_token,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        query: `
          mutation {
            appSubscriptionCreate(
              name: "AI Chat Pro Plan",
              returnUrl: "${process.env.APP_URL || "https://ai-chat-backend-c3y7.onrender.com"}/confirm-charge?shop=${shop}",
              test: true,
              lineItems: [
                {
                  plan: {
                    appRecurringPricingDetails: {
                      price: { amount: 19.0, currencyCode: "USD" }
                      interval: EVERY_30_DAYS
                    }
                  }
                }
              ]
            ) {
              confirmationUrl
              userErrors {
                field
                message
              }
            }
          }
        `
      })
    });

    const data = await response.json();
    const url = data?.data?.appSubscriptionCreate?.confirmationUrl;

    if (!url) {
      return res.send("Shopify Error: " + JSON.stringify(data));
    }

    res.redirect(url);

  } catch (error) {
    console.error("Charge creation error:", error);
    res.send("Server error");
  }
});

// =============================
// CONFIRM PAYMENT
// =============================
app.get("/confirm-charge", async (req, res) => {
  const { shop } = req.query;

  if (!shop) {
    return res.status(400).send("Missing shop parameter");
  }

  try {
    await supabase
      .from("users")
      .update({ plan: "paid" })
      .eq("shop", shop);

    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Payment Confirmed</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; text-align: center; padding: 40px; }
          .success { color: #10b981; font-size: 24px; margin-bottom: 20px; }
          .info { color: #666; margin-bottom: 10px; }
          a { color: #0066cc; text-decoration: none; }
        </style>
      </head>
      <body>
        <div class="success">🎉 Payment Successful!</div>
        <p class="info">Your PRO plan is now active.</p>
        <p class="info">Unlimited conversations and priority support.</p>
        <p class="info"><a href="https://${shop}/admin">Return to Shopify Admin</a></p>
      </body>
      </html>
    `);

  } catch (error) {
    console.error("Payment confirmation error:", error);
    res.status(500).send("Error confirming payment");
  }
});

// =============================
// ADMIN DASHBOARD
// =============================
app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "admin.html"));
});

// =============================
// API: GET SCRIPTS
// =============================
app.get("/api/scripts", async (req, res) => {
  const { shop } = req.query;

  if (!shop) {
    return res.status(400).json({ error: "Missing shop parameter" });
  }

  try {
    const { data: user } = await supabase
      .from("users")
      .select("access_token")
      .eq("shop", shop)
      .single();

    if (!user || !user.access_token) {
      return res.status(404).json({ error: "Store not found" });
    }

    const response = await fetch(`https://${shop}/admin/api/2024-01/script_tags.json`, {
      headers: {
        "X-Shopify-Access-Token": user.access_token
      }
    });

    const data = await response.json();
    res.json({ scripts: data.script_tags || [] });

  } catch (error) {
    console.error("Error fetching scripts:", error);
    res.status(500).json({ error: "Failed to fetch scripts" });
  }
});

// =============================
// API: CLEANUP SCRIPTS
// =============================
app.post("/api/cleanup-scripts", async (req, res) => {
  const { shop } = req.body;

  if (!shop) {
    return res.status(400).json({ error: "Missing shop parameter" });
  }

  try {
    const { data: user } = await supabase
      .from("users")
      .select("access_token")
      .eq("shop", shop)
      .single();

    if (!user || !user.access_token) {
      return res.status(404).json({ error: "Store not found" });
    }

    // Get all scripts
    const getResponse = await fetch(`https://${shop}/admin/api/2024-01/script_tags.json`, {
      headers: {
        "X-Shopify-Access-Token": user.access_token
      }
    });

    const getData = await getResponse.json();
    const scripts = getData.script_tags || [];

    // Delete all widget scripts (keep only the latest)
    const widgetScripts = scripts.filter(s => s.src.includes('widget.js'));
    
    if (widgetScripts.length > 1) {
      // Keep the latest one, delete the rest
      const latestScript = widgetScripts[widgetScripts.length - 1];
      
      for (const script of widgetScripts) {
        if (script.id !== latestScript.id) {
          await fetch(`https://${shop}/admin/api/2024-01/script_tags/${script.id}.json`, {
            method: "DELETE",
            headers: {
              "X-Shopify-Access-Token": user.access_token
            }
          });
        }
      }
    }

    res.json({ success: true, message: "Scripts cleaned up successfully" });

  } catch (error) {
    console.error("Error cleaning up scripts:", error);
    res.status(500).json({ error: "Failed to cleanup scripts" });
  }
});

// =============================
// HELPER FUNCTIONS
// =============================

function groupByDate(items) {
  const grouped = {};
  items.forEach(item => {
    const date = new Date(item.created_at).toISOString().split('T')[0];
    grouped[date] = (grouped[date] || 0) + 1;
  });
  return grouped;
}

// =============================
// SERVER START
// =============================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 AI Sales Agent Server running on port ${PORT}`);
  console.log(`📊 Admin API available at /api/admin/*`);
  console.log(`💬 Chat API available at /chat`);
  console.log(`🎛️ Admin Dashboard available at /admin`);
});
