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

// ================= ENV CHECK =================
console.log("🚀 GEMINI KEY:", !!process.env.GEMINI_API_KEY);
console.log("🚀 GROQ KEY:", !!process.env.GROQ_API_KEY);

// ================= INIT =================
const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

const groq = process.env.GROQ_API_KEY
  ? new Groq({
      apiKey: process.env.GROQ_API_KEY
    })
  : null;

// ================= HEALTH =================
app.get("/", (req, res) => {
  res.json({
    status: "OK",
    message: "TeeniWood API Running"
  });
});

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    gemini: !!process.env.GEMINI_API_KEY,
    groq: !!process.env.GROQ_API_KEY
  });
});

app.get("/api/test", (req, res) => {
  res.json({
    success: true
  });
});

// ================= SAFE CONTENT =================
function safeContent(topic = "Demo", raw = "") {
  return {
    title: `🔥 ${topic}`,
    description: raw || "AI generated content",
    seo_keywords: [topic, "viral", "ai"],
    hashtags: ["#viral", "#ai", "#shorts"],
    tags: ["youtube", "ai"],
    hooks: [
      "🔥 Watch till end!",
      "😱 Crazy!",
      "🚀 Viral story!"
    ],
    script: [
      {
        scene: "0-5 sec",
        text: `Hook: ${topic}`,
        voice_over: "Start",
        visual: "cinematic"
      }
    ]
  };
}

// ================= GENERATE =================
app.post("/api/generate", async (req, res) => {
  try {

    const {
      topic,
      engine = "gemini",
      language = "Hindi"
    } = req.body;

    if (!topic) {
      return res.json({
        success: false,
        content: safeContent("Demo")
      });
    }

    const seed = Date.now();
    let text = "";

    // ==================================================
    // GEMINI
    // ==================================================
    if (engine === "gemini") {

      if (!genAI) {
        throw new Error(
          "Gemini API Key missing in Render ENV"
        );
      }

      const prompt = `
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
`;

      const models = [
        "gemini-1.5-flash",
        "gemini-1.5-pro",
        "gemini-1.5-flash-8b"
      ];

      let result = null;
      let lastError = null;

      for (const modelName of models) {
        try {

          console.log(
            "🔍 Trying Gemini model:",
            modelName
          );

          const model =
            genAI.getGenerativeModel({
              model: modelName
            });

          result =
            await model.generateContent(prompt);

          console.log(
            "✅ Gemini Success:",
            modelName
          );

          break;

        } catch (err) {

          console.log(
            "❌ Gemini Failed:",
            modelName
          );

          console.log(
            "❌ Reason:",
            err.message
          );

          lastError = err;
        }
      }

      if (!result) {
        throw new Error(
          `All Gemini models failed. Last Error: ${
            lastError?.message || "Unknown Error"
          }`
        );
      }

      const response = await result.response;
      text = response.text();
    }

    // ==================================================
    // GROQ
    // ==================================================
    else {

      if (!groq) {
        throw new Error(
          "Groq API Key missing in Render ENV"
        );
      }

      const completion =
        await groq.chat.completions.create({
          model: "llama-3.3-70b-versatile",
          messages: [
            {
              role: "user",
              content: `
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
`
            }
          ]
        });

      text =
        completion?.choices?.[0]?.message?.content ||
        "";
    }

    // ==================================================
    // CLEAN JSON
    // ==================================================
    let cleaned = (text || "")
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .replace(/^[^{]*/, "")
      .trim();

    let data;

    try {

      data = JSON.parse(cleaned);

    } catch (e) {

      console.log("❌ JSON Parse Failed");
      console.log("❌ RAW OUTPUT:");
      console.log(text);

      data = safeContent(topic, text);
    }

    return res.json({
      success: true,
      content: data
    });

  } catch (error) {

    console.error(
      "🔥 FULL ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      error: error.message,
      details: String(error),
      content: safeContent(
        req.body?.topic || "Demo",
        error.message
      )
    });
  }
});

// ================= START =================
app.listen(PORT, () => {
  console.log(
    "🚀 Server running on port",
    PORT
  );
});
