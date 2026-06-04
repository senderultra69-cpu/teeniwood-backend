import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Gemini setup (SAFE ADD)
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

// 🟢 GEMINI TEST ROUTE
app.get("/api/gemini-test", async (req, res) => {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash"
    });

    const result = await model.generateContent("Say hello from TeeniWood AI");
    const response = await result.response;

    res.json({
      success: true,
      reply: response.text()
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 🟢 MAIN GENERATE API (YOUR BASE + SAFE ADDITIONS)
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
Generate viral YouTube Shorts content.

Topic: ${topic}
Language: ${language || "Hindi"}

Return ONLY valid JSON:

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
    const text = response.text();

    let parsed;

    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = {
        title: topic,
        topic,
        niche: niche || "General",
        engine: "gemini",
        seo_keywords: [],
        viral_score: 60,
        description: text,
        hashtags: [],
        tags: [],
        hooks: [],
        thumbnail_prompt: "",
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
