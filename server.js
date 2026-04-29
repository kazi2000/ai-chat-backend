import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";
import fetch from "node-fetch";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Chat API
app.post("/chat", async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    // Get user plan
const { data: user } = await supabase
  .from("users")
  .select("*")
  .eq("shop", sessionId)
  .single();

// Check limits
if (user.plan === "free" && user.message_count >= 50) {
  return res.json({
    reply: "⚠️ Free limit reached. Upgrade to continue using AI."
  });
}

    // Get previous memory
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

    // Store memory
    await supabase.from("chat_memory").insert([
      // Increase message count
await supabase
  .from("users")
  .update({ message_count: user.message_count + 1 })
  .eq("shop", sessionId);
      { session_id: sessionId, message: message },
      { session_id: sessionId, message: reply }
    ]);

    res.json({ reply });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
});
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

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.get("/widget.js", (req, res) => {
  res.sendFile(path.join(__dirname, "widget.js"));
});

app.get("/install", (req, res) => {
  const shop = req.query.shop;

  const apiKey = process.env.SHOPIFY_API_KEY;
  console.log("CALLBACK HIT");
  console.log(req.query);

  const redirectUri = "https://ai-chat-backend-c3y7.onrender.com/auth/callback";

  const installUrl = `https://${shop}/admin/oauth/authorize?client_id=${apiKey}&scope=write_script_tags&redirect_uri=${redirectUri}`;

  res.redirect(installUrl);
});

app.get("/auth/callback", async (req, res) => {
  const { shop, code } = req.query;

  const apiKey = process.env.SHOPIFY_API_KEY;
  const apiSecret = process.env.SHOPIFY_API_SECRET;

  const tokenRes = await fetch(`https://${shop}/admin/oauth/access_token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      client_id: apiKey,
      client_secret: apiSecret,
      code
    })
  });

  const tokenData = await tokenRes.json();

  const accessToken = tokenData.access_token;

  const { data, error } = await supabase.from("users").upsert({
  shop: shop,
  plan: "free",
  message_count: 0
});

console.log("SUPABASE INSERT:", data, error);

  // Call your install script API
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

  res.send("App installed successfully 🎉");
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
