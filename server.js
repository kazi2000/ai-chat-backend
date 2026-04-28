import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

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
      { session_id: sessionId, message: message },
      { session_id: sessionId, message: reply }
    ]);

    res.json({ reply });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
