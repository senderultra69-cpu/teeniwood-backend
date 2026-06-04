import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";

dotenv.config();

const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());

const PORT = process.env.PORT || 3000;

// ================= ENV DEBUG =================
console.log("🚀 GEMINI KEY:", !!process.env.GEMINI_API_KEY);
console.log("🚀 GROQ KEY:", !!process.env.GROQ_API_KEY);

// ================= AI SETUP =================
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ================= HEALTH =================
app.get("/", (req, res) => {
  res.json({ status: "OK", time: new Date().toISOString() });
});

app.get("/api/test", (req, res) => {
  res.json({ success: true });
});

// ================= DEBUG =================
app.get("/debug", (req, res) => {
  res.json({
    gemini: !!process.env.GEMINI_API_KEY,
    groq: !!process.env.GROQ_API_KEY
  });
});

// ================= SAFE FALLBACK =================
function safeContent(topic = "Demo", raw = "") {
  return {
    title: `🔥 ${topic}`,
    description: raw || "AI generated content",
    seo_keywords: [topic, "viral", "ai"],
    hashtags: ["#viral", "#ai", "#shorts"],
    tags: ["youtube", "ai"],
    hooks: ["🔥 Watch till end!", "😱 Crazy!", "🚀 Viral story!"],
    script: [
      {
        scene: "0-5",
        text: `Hook: ${topic}`,
        voice_over: "Start",
        visual: "cinematic"
      }
    ]
  };
}

// ================= MAIN API =================
app.post("/api/generate", async (req, res) => {
  try {
    const { topic, engine = "gemini", language = "Hindi" } = req.body;

    if (!topic) {
      return res.json({
        success: false,
        content: safeContent("Demo")
      });
    }

    const seed = Date.now();
    let text = "";

    // ================= GEMINI =================
    if (engine === "gemini") {
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash"
      });

      const result = await model.generateContent(`
Return ONLY valid JSON.

Topic: ${topic}
Language: ${language}
Seed: ${seed}

{
  "title": "",
  "description": "",
  "seo_keywords": [],
  "hashtags": [],
  "tags": [],
  "hooks": [],
  "script": []
}
`);

      const response = await result.response;
      text = response.text();
    }

    // ================= GROQ =================
    else {
      const completion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "user",
            content: `Return ONLY JSON.

Topic: ${topic}
Seed: ${seed}`
          }
        ]
      });

      text = completion.choices[0].message.content;
    }

    // ================= CLEAN JSON =================
    let cleaned = (text || "")
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .replace(/^[^{]*/, "") // FIX IMPORTANT
      .trim();

    let data;

    try {
      data = JSON.parse(cleaned);
    } catch (e) {
      console.log("❌ RAW OUTPUT:", text);
      data = safeContent(topic, text);
    }

    return res.json({
      success: true,
      content: data
    });

  } catch (error) {
    console.log("❌ FULL ERROR:", error);

    return res.status(500).json({
      success: false,
      error: error.message,
      content: safeContent(req.body?.topic, error.message)
    });
  }
});

// ================= START SERVER =================
app.listen(PORT, () => {
  console.log("🚀 Server running on port", PORT);
});
