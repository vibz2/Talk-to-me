import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import crypto from "crypto";
import THERAPY_TYPES from "../src/prompts.js"; // adjust path if needed

dotenv.config();

const app = express();
app.use(cors({
  origin: true,
  credentials: true, // allow cookies
}));
app.use(express.json());
app.use(cookieParser());

const PORT = process.env.PORT || 4000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error("Missing GEMINI_API_KEY in environment. See .env");
  process.exit(1);
}

// In-memory conversation store
const memoryStore = {};

// Health check
app.get("/", (req, res) => {
  res.send("AI Therapist backend is running!");
});

// Generate AI response
app.post("/api/generate", async (req, res) => {
  try {
    const { mode, messages } = req.body;

    if (!mode || !messages || !THERAPY_TYPES[mode]) {
      return res.status(400).json({ error: "Invalid or missing therapy mode or messages" });
    }

    // Get or create userId via cookie
    let userId = req.cookies.userId;
    if (!userId) {
      userId = crypto.randomUUID();
      res.cookie("userId", userId, { maxAge: 365 * 24 * 60 * 60 * 1000 }); // 1 year
    }

    // Initialize user memory if not exists
    if (!memoryStore[userId]) memoryStore[userId] = [];

    // Add user message to memory
    memoryStore[userId].push({ role: "user", text: messages });

    const systemPrompt = THERAPY_TYPES[mode].systemPrompt;

    // Prepare Gemini contents (NO system role here)
    const contents = memoryStore[userId].map(msg => ({
      role: msg.role === "assistant" ? "model" : "user", // Gemini uses "model" not "assistant"
      parts: [{ text: msg.text }]
    }));

    const payload = {
      contents,
      systemInstruction: {  // Use systemInstruction instead of system role
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

    // Extract AI reply correctly
    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || 
                   "Sorry, I couldn't generate a response.";

    // Add AI response to memory with correct role
    memoryStore[userId].push({ role: "model", text: aiText });

    res.json({ output: aiText });
  } catch (error) {
    console.error("Error calling Gemini:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));