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

// 🔥 AI SETUP
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

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

// 🟢 MAIN GENERATE API (DUAL AI)
app.post("/api/generate", async (req, res) => {
  try {

    const { topic, niche, engine, language } = req.body;

    if (!topic) {
      return res.status(400).json({
        error: "Topic required"
      });
    }

    let text = "";

    // 🔵 GEMINI
    if (!engine || engine === "gemini") {

      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash"
      });

      const result = await model.generateContent(`
Generate viral YouTube Shorts content in ${language || "Hindi"}.

Topic: ${topic}

Return ONLY JSON:
{
  "title": "",
  "description": "",
  "seo_keywords": [],
  "hashtags": [],
  "tags": [],
  "hooks": [],
  "viral_score": 0,
  "script": []
}
`);

      const response = await result.response;
      text = response.text();
    }

    // 🟢 GROQ
    else if (engine === "groq") {

      const completion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "user",
            content: `Create viral YouTube Shorts JSON for topic: ${topic}`
          }
        ]
      });

      text = completion.choices[0].message.content;
    }

    // 🧹 CLEAN RESPONSE
    text = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    let parsed;

    try {
      parsed = JSON.parse(text);
    } catch (e) {
      parsed = {
        title: `🔥 ${topic}`,
        description: text,
        seo_keywords: [],
        hashtags: [],
        tags: [],
        hooks: [],
        viral_score: 50,
        script: []
      };
    }

    res.json({
      success: true,
      engine: engine || "gemini",
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
