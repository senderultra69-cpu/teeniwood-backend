import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Gemini Setup
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// HEALTH CHECK
app.get("/", (req, res) => {
  res.json({
    status: "TeeniWood AI Backend Running 🚀",
    time: new Date().toISOString()
  });
});

// TEST
app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "Backend Working 🚀"
  });
});

// MAIN AI GENERATOR
app.post("/api/generate", async (req, res) => {
  try {

    const { topic, language } = req.body;

    if (!topic) {
      return res.status(400).json({
        error: "Topic required"
      });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash"
    });

    const prompt = `
You are a professional viral YouTube Shorts AI.

Generate highly engaging content in ${language || "Hindi"}.

TOPIC: ${topic}

Return ONLY valid JSON:

{
  "title": "",
  "seo_keywords": [],
  "viral_score": 0,
  "story": "",
  "hashtags": [],
  "tags": [],
  "hooks": [],
  "thumbnail_prompt": "",
  "scenes": [
    {
      "time": "0-5 sec",
      "visual": "",
      "voice_over": ""
    },
    {
      "time": "5-10 sec",
      "visual": "",
      "voice_over": ""
    },
    {
      "time": "10-15 sec",
      "visual": "",
      "voice_over": ""
    },
    {
      "time": "15-20 sec",
      "visual": "",
      "voice_over": ""
    },
    {
      "time": "20-25 sec",
      "visual": "",
      "voice_over": ""
    }
  ]
}

Rules:
- Must be emotional and viral
- SEO optimized
- Easy Hindi/English mix if needed
- Each scene 5 seconds
- Must include strong hook
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
        seo_keywords: [],
        viral_score: 50,
        story: text,
        hashtags: [],
        tags: [],
        hooks: [],
        thumbnail_prompt: "",
        scenes: []
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
