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

// HEALTH
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
Return ONLY JSON.

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
            content: `Create viral JSON for topic: ${topic}`
          }
        ]
      });

      text = completion.choices[0].message.content;
    }

    // CLEAN
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
        script: []
      };
    }

    // 🔥 IMPORTANT FIX (frontend safe)
    res.json({
      success: true,
      content: parsed   // <-- ALWAYS SAME FORMAT
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
