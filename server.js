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

// 🔥 AI CLIENTS (same as python test)
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

// 🟢 TEST ROUTE (Python match style)
app.get("/api/test", async (req, res) => {
  res.json({
    success: true,
    message: "Backend Working 🚀"
  });
});

// 🟢 MAIN GENERATE API (PYTHON MATCH STYLE)
app.post("/api/generate", async (req, res) => {
  try {

    const { topic, engine, language } = req.body;

    const PROMPT = topic || "Hello, tell me your model name.";

    let geminiResult = null;
    let groqResult = null;

    // =========================
    // 🔵 GEMINI TEST
    // =========================
    try {
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash"
      });

      const result = await model.generateContent(PROMPT);
      const response = await result.response;
      geminiResult = response.text();

      console.log("✅ GEMINI SUCCESS");
    } catch (e) {
      geminiResult = null;
      console.log("❌ GEMINI FAILED:", e.message);
    }

    // =========================
    // 🟢 GROQ TEST
    // =========================
    try {
      const completion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "user", content: PROMPT }
        ]
      });

      groqResult = completion.choices[0].message.content;

      console.log("✅ GROQ SUCCESS");
    } catch (e) {
      groqResult = null;
      console.log("❌ GROQ FAILED:", e.message);
    }

    // =========================
    // 📦 FINAL RESPONSE (PYTHON STYLE)
    // =========================
    res.json({
      success: true,

      gemini: {
        working: geminiResult ? true : false,
        response: geminiResult
      },

      groq: {
        working: groqResult ? true : false,
        response: groqResult
      }
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
