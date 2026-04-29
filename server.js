import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";

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
// CHAT API
// =============================
app.post("/chat", async (req, res) => {
  try {
    const { message, sessionId } = req.body;

    // Get user
    const { data: user } = await supabase
      .from("users")
      .select("*")
      .eq("shop", sessionId)
      .single();

    // Free plan limit
    if (user.plan === "free" && user.message_count >= 50) {
      return res.json({
        reply: "⚠️ Free limit reached. Upgrade to continue."
      });
    }

    // Get memory
    const { data: memory } = await supabase
      .from("chat_memory")
      .select("*")
      .eq("session_id", sessionId);

    const context = memory?.map(m => m.message).join("\n") || "";

    // AI response
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a sales assistant." },
        { role: "user", content: context + "\n" + message }
      ],
    });

    const reply = response.choices[0].message.content;

    // ✅ Update message count
    await supabase
      .from("users")
      .update({ message_count: user.message_count + 1 })
      .eq("shop", sessionId);

    // ✅ Store memory
    await supabase.from("chat_memory").insert([
      { session_id: sessionId, message: message },
      { session_id: sessionId, message: reply }
    ]);

    res.json({ reply });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
});


// =============================
// SERVE WIDGET
// =============================
app.get("/widget.js", (req, res) => {
  res.sendFile(path.join(__dirname, "widget.js"));
});


// =============================
// INSTALL APP
// =============================
app.get("/install", (req, res) => {
  const shop = req.query.shop;

  const apiKey = process.env.SHOPIFY_API_KEY;
  const redirectUri = "https://ai-chat-backend-c3y7.onrender.com/auth/callback";

  const installUrl = `https://${shop}/admin/oauth/authorize?client_id=${apiKey}&scope=write_script_tags,read_script_tags&redirect_uri=${redirectUri}`;

  res.redirect(installUrl);
});


// =============================
// AUTH CALLBACK
// =============================
app.get("/auth/callback", async (req, res) => {
  const { shop, code } = req.query;

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
    console.log("TOKEN DATA:", tokenData);
    const accessToken = tokenData.access_token;

    // Save user
    await supabase.from("users").upsert({
      shop,
      plan: "free",
      message_count: 0,
      access_token: accessToken
    });

    // Install widget script
    await fetch("https://ai-chat-backend-c3y7.onrender.com/install-script", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        shop,
        accessToken
      })
    });

    res.send("✅ App installed successfully");

  } catch (error) {
    console.error(error);
    res.status(500).send("Auth error");
  }
});


// =============================
// INSTALL SCRIPT TO SHOPIFY
// =============================
app.post("/install-script", async (req, res) => {
  const { shop, accessToken } = req.body;

  try {
    const response = await fetch(`https://${shop}/admin/api/2024-01/script_tags.json`, {
      method: "POST",
      headers: {
        "X-Shopify-Access-Token": accessToken,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        script_tag: {
          event: "onload",
          src: "https://ai-chat-backend-c3y7.onrender.com/widget.js"
        }
      })
    });

    const data = await response.json();
    res.json(data);

  } catch (error) {
    console.error(error);
    res.status(500).send("Error installing script");
  }
});


// =============================
// CREATE CHARGE (PAID PLAN)
// =============================
app.get("/create-charge", async (req, res) => {
  const shop = req.query.shop;

  try {
    const { data: user } = await supabase
      .from("users")
      .select("*")
      .eq("shop", shop)
      .single();

    console.log("USER:", user);

    if (!user || !user.access_token) {
      return res.send("❌ No access token found. Reinstall app.");
    }

    const response = await fetch(`https://${shop}/admin/api/2024-01/recurring_application_charges.json`, {
      method: "POST",
      headers: {
        "X-Shopify-Access-Token": user.access_token,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        recurring_application_charge: {
          name: "AI Chat Pro Plan",
          price: 19.0,
          return_url: `https://ai-chat-backend-c3y7.onrender.com/confirm-charge?shop=${shop}`,
          test: true
        }
      })
    });

    const data = await response.json();

    console.log("SHOPIFY RESPONSE:", data);

    // 👇 THIS IS THE KEY PART
    if (data.errors) {
      return res.send("❌ Shopify Error: " + JSON.stringify(data.errors));
    }

    res.redirect(data.recurring_application_charge.confirmation_url);

  } catch (error) {
    console.error("ERROR:", error);
    res.send("❌ Server error: " + error.message);
  }
});


// =============================
// CONFIRM PAYMENT
// =============================
app.get("/confirm-charge", async (req, res) => {
  const { shop } = req.query;

  try {
    await supabase
      .from("users")
      .update({ plan: "paid" })
      .eq("shop", shop);

    res.send("🎉 Payment successful! PRO plan activated.");

  } catch (error) {
    console.error(error);
    res.status(500).send("Error confirming payment");
  }
});


// =============================
app.listen(3000, () => {
  console.log("Server running on port 3000");
});
