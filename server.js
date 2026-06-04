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
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// HEALTH CHECK
app.get("/", (req, res) => {
  res.json({
    status: "TeeniWood AI Backend Running 🚀",
    time: new Date().toISOString()
  });
});

// TEST ROUTE
app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "Backend Working 🚀"
  });
});

// MAIN API
app.post("/api/generate", async (req, res) => {
  try {

    const { topic, engine, language } = req.body;

    if (!topic) {
      return res.status(400).json({
        success: false,
        error: "Topic required"
      });
    }

    let text = "";

    // GEMINI
    if (!engine || engine === "gemini") {
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash"
      });

      const result = await model.generateContent(`
Return ONLY valid JSON (no markdown, no explanation).

Topic: ${topic}
Language: ${language || "Hindi"}

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

    // GROQ
    else if (engine === "groq") {
      const completion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "user",
            content: `Return STRICT JSON ONLY for topic: ${topic}`
          }
        ]
      });

      text = completion.choices[0].message.content;
    }

    // CLEAN RESPONSE
    let parsed;

    try {
      const cleanText = (text || "")
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      if (!cleanText) throw new Error("Empty response");

      parsed = JSON.parse(cleanText);

    } catch (e) {
      console.log("⚠ RAW AI OUTPUT:", text);

      parsed = {
        title: `🔥 ${topic} Viral Story`,
        description: text || "AI response failed",
        seo_keywords: [`${topic}`, "viral", "youtube shorts"],
        hashtags: ["#viral", "#teeniwood", "#ai"],
        tags: ["viral", "shorts", "ai video"],
        hooks: [
          "😱 You won't believe this!",
          "🔥 Emotional twist!",
          "🚀 Watch till end!"
        ],
        script: [
          {
            scene: "0-5 sec",
            text: `Hook about ${topic}`,
            voice_over: "Start of viral story",
            visual: "Cinematic intro"
          }
        ]
      };
    }

    // 🔥 ALWAYS SAFE RESPONSE (FRONTEND FIX)
    return res.json({
      success: true,
      content: parsed
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      error: error.message,
      content: null
    });
  }
});

app.listen(PORT, () => {
  console.log(`TeeniWood AI running on port ${PORT}`);
});
