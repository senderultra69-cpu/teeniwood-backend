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
  res.json({ status: "OK", time: new Date().toISOString() });
});

// TEST
app.get("/api/test", (req, res) => {
  res.json({ success: true });
});

// 🔥 SAFE FALLBACK BUILDER
function safeContent(topic, raw = "") {
  return {
    title: `🔥 ${topic || "Viral Story"}`,
    description: raw || `AI generated content for ${topic}`,
    seo_keywords: [topic, "viral", "shorts"],
    hashtags: ["#viral", "#teeniwood", "#ai"],
    tags: ["youtube", "shorts", "ai video"],
    hooks: [
      "🔥 Watch till end!",
      "😱 You won't believe this!",
      "🚀 Viral story incoming!"
    ],
    script: [
      {
        scene: "0-5",
        text: `Hook about ${topic}`,
        voice_over: "Start of story",
        visual: "cinematic intro"
      }
    ]
  };
}

// MAIN API
app.post("/api/generate", async (req, res) => {
  try {
    const { topic, engine = "gemini", language = "Hindi" } = req.body;

    if (!topic) {
      return res.json({
        success: false,
        content: safeContent("Demo", "No topic provided")
      });
    }

    let text = "";

    // GEMINI
    if (engine === "gemini") {
      try {
        const model = genAI.getGenerativeModel({
          model: "gemini-1.5-flash"
        });

        const result = await model.generateContent(
`Return ONLY valid JSON.

Topic: ${topic}
Language: ${language}

{
  "title": "",
  "description": "",
  "seo_keywords": [],
  "hashtags": [],
  "tags": [],
  "hooks": [],
  "script": []
}`
        );

        const response = await result.response;
        text = response.text();
      } catch (e) {
        console.log("Gemini error:", e.message);
      }
    }

    // GROQ
    else {
      try {
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
      } catch (e) {
        console.log("Groq error:", e.message);
      }
    }

    // CLEAN
    let cleaned = (text || "")
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    let data;

    try {
      data = JSON.parse(cleaned);

      // validation
      if (!data.title) throw new Error("Invalid JSON");
    } catch {
      data = safeContent(topic, text);
    }

    return res.json({
      success: true,
      content: data
    });

  } catch (error) {
    return res.json({
      success: true,
      content: safeContent(req.body?.topic, error.message)
    });
  }
});

app.listen(PORT, () => {
  console.log("Server running on", PORT);
});
