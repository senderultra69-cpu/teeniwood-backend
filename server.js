import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Gemini setup
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// 🟢 HEALTH CHECK
app.get("/", (req, res) => {
  res.json({
    status: "TeeniWood AI Backend Running 🚀",
    time: new Date().toISOString()
  });
});

// 🟢 TEST ROUTE
app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "Backend Working 🚀"
  });
});

// 🟢 MAIN GENERATE API
app.post("/api/generate", async (req, res) => {
  try {

    const { topic, niche, engine, language } = req.body;

    if (!topic) {
      return res.status(400).json({
        error: "Topic required"
      });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash"
    });

    const prompt = `
You are a viral YouTube Shorts AI.

Topic: ${topic}
Language: ${language || "Hindi"}

Return ONLY valid JSON. No markdown, no explanation.

{
  "title": "",
  "topic": "${topic}",
  "niche": "${niche || "General"}",
  "engine": "gemini",
  "seo_keywords": [],
  "viral_score": 0,
  "description": "",
  "hashtags": [],
  "tags": [],
  "hooks": [],
  "thumbnail_prompt": "",
  "script": [
    {
      "scene": "0-5 sec",
      "text": "",
      "voice_over": "",
      "visual": ""
    },
    {
      "scene": "5-10 sec",
      "text": "",
      "voice_over": "",
      "visual": ""
    },
    {
      "scene": "10-15 sec",
      "text": "",
      "voice_over": "",
      "visual": ""
    }
  ]
}
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    // 🔥 CLEAN GEMINI OUTPUT (IMPORTANT FIX)
    text = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    let parsed;

    try {
      parsed = JSON.parse(text);
    } catch (e) {
      console.log("RAW GEMINI OUTPUT:", text);

      parsed = {
        title: `🔥 ${topic} Viral Story`,
        topic,
        niche: niche || "General",
        engine: "gemini",

        seo_keywords: [
          `${topic} viral`,
          `${topic} story`,
          "youtube shorts",
          "trending"
        ],

        viral_score: 60,

        description: text,
        hashtags: [
          "#viral",
          "#teeniwood",
          "#youtube",
          "#shorts"
        ],

        tags: [
          "viral story",
          "youtube shorts",
          "ai video"
        ],

        hooks: [
          "😱 You won't believe this!",
          "🔥 Emotional story incoming!",
          "🚀 Must watch till end!"
        ],

        thumbnail_prompt: `Cinematic viral thumbnail for ${topic}`,

        script: []
      };
    }

    res.json({
      success: true,
      content: parsed
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`TeeniWood AI running on port ${PORT}`);
});
