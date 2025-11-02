import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import crypto from "crypto";
import THERAPY_TYPES from "../src/prompts.js"; 

dotenv.config();

const app = express();
app.use(cors({
  origin: true,
  credentials: true, 
}));
app.use(express.json());
app.use(cookieParser());

const PORT = process.env.PORT || 4000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error("Missing GEMINI_API_KEY in environment. See .env");
  process.exit(1);
}

const memoryStore = {};

app.get("/", (req, res) => {
  res.send("AI Therapist backend is running!");
});

app.post("/api/generate", async (req, res) => {
  try {
    const { mode, messages } = req.body;

    if (!mode || !messages || !THERAPY_TYPES[mode]) {
      return res.status(400).json({ error: "Invalid or missing therapy mode or messages" });
    }

    let userId = req.cookies.userId;
    if (!userId) {
      userId = crypto.randomUUID();
      res.cookie("userId", userId, { maxAge: 365 * 24 * 60 * 60 * 1000 });
    }

    if (!memoryStore[userId]) memoryStore[userId] = [];

    memoryStore[userId].push({ role: "user", text: messages });

    const systemPrompt = THERAPY_TYPES[mode].systemPrompt;

    const contents = memoryStore[userId].map(msg => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.text }]
    }));

    const payload = {
      contents,
      systemInstruction: {  
        parts: [{ text: systemPrompt }]
      },
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        topK: 64
      }
    };

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();

    if (data.error) {
      console.error("Gemini API Error:", data.error);
      return res.status(500).json({ error: data.error });
    }

    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || 
                   "Sorry, I couldn't generate a response.";

    memoryStore[userId].push({ role: "model", text: aiText });

    res.json({ output: aiText });
  } catch (error) {
    console.error("Error calling Gemini:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));