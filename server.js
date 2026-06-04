import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// AI SETUP
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// HEALTH
app.get("/", (req, res) => {
  res.json({ status: "OK", time: new Date() });
});

// TEST
app.get("/api/test", (req, res) => {
  res.json({ success: true });
});

// MAIN API
app.post("/api/generate", async (req, res) => {
  try {
    const { topic, engine = "gemini", language = "Hindi" } = req.body;

    if (!topic) {
      return res.json({
        success: false,
        error: "Topic required"
      });
    }

    let text = "";

    // ================= GEMINI =================
    if (engine === "gemini") {
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash"
      });

      const result = await model.generateContent(
`You are a JSON generator.

Return ONLY valid JSON.

Topic: ${topic}
Language: ${language}

{
  "title": "",
  "description": "",
  "seo_keywords": [],
  "hashtags": [],
  "tags": [],
  "hooks": [],
  "script": [
    {
      "scene": "0-5",
      "text": "",
      "voice_over": "",
      "visual": ""
    }
  ]
}`
      );

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
            content: `Return ONLY JSON for topic: ${topic}`
          }
        ]
      });

      text = completion.choices[0].message.content;
    }

    // ================= CLEAN =================
    let cleaned = (text || "")
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .replace(/^[^{]*/, "")
      .trim();

    let data;

    try {
      data = JSON.parse(cleaned);
    } catch (e) {
      console.log("RAW AI OUTPUT:", text);

      // 🔥 SAFE FALLBACK (hidden logic, no UI mess)
      data = {
        title: `🔥 ${topic}`,
        description: text || "Generated content",
        seo_keywords: [topic, "viral", "shorts"],
        hashtags: ["#viral", "#teeniwood"],
        tags: ["ai", "youtube"],
        hooks: ["🔥 Watch now!", "😱 Amazing!", "🚀 Viral!"],
        script: [
          {
            scene: "0-5",
            text: `Hook about ${topic}`,
            voice_over: "Start",
            visual: "cinematic"
          }
        ]
      };
    }

    // 🔥 ALWAYS SAME FORMAT (IMPORTANT FIX)
    return res.json({
      success: true,
      content: data
    });

  } catch (error) {
    console.log(error);

    return res.json({
      success: false,
      error: error.message,
      content: {
        title: `🔥 ${req.body.topic || "Video"}`,
        description: "System recovery mode",
        seo_keywords: [],
        hashtags: [],
        tags: [],
        hooks: [],
        script: []
      }
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
