import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Groq from "groq-sdk";

dotenv.config();

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());

const PORT = process.env.PORT || 3000;

console.log("🚀 GROQ KEY:", !!process.env.GROQ_API_KEY);

const groq = process.env.GROQ_API_KEY
  ? new Groq({
      apiKey: process.env.GROQ_API_KEY
    })
  : null;

// ================= ROOT =================

app.get("/", (req, res) => {
  res.json({
    status: "OK",
    message: "TeeniWood API Running"
  });
});

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
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
        visual: "cinematic intro"
      },
      {
        scene: "5-10 sec",
        text: `Main story about ${topic}`,
        visual: "story scene"
      },
      {
        scene: "10-15 sec",
        text: "Ending with call to action",
        visual: "subscribe animation"
      }
    ]
  };
}

// ================= GENERATE =================

app.post("/api/generate", async (req, res) => {
  try {

    const { topic, language = "Hindi" } = req.body;

    if (!topic) {
      return res.json({
        success: false,
        content: safeContent("Demo")
      });
    }

    if (!groq) {
      throw new Error("GROQ_API_KEY missing");
    }

    const seed = Date.now();

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
  "script": [
    {
      "scene": "0-5 sec",
      "text": "",
      "visual": ""
    },
    {
      "scene": "5-10 sec",
      "text": "",
      "visual": ""
    },
    {
      "scene": "10-15 sec",
      "text": "",
      "visual": ""
    }
  ]
}

IMPORTANT:
- Return ONLY valid JSON.
- script MUST be an array of objects.
- Every script item must contain scene, text and visual.
- Do NOT return script as string array.
`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7
    });

    const text =
      completion?.choices?.[0]?.message?.content || "";

    let cleaned = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    let data;

    try {

      data = JSON.parse(cleaned);

      if (Array.isArray(data.script)) {
        data.script = data.script.map((item, index) => {

          if (typeof item === "string") {
            return {
              scene: `Scene ${index + 1}`,
              text: item,
              visual: ""
            };
          }

          return {
            scene: item.scene || `Scene ${index + 1}`,
            text: item.text || "",
            visual: item.visual || ""
          };
        });
      }

    } catch (e) {

      console.log("JSON Parse Failed");
      console.log(text);

      data = safeContent(topic, text);
    }

    return res.json({
      success: true,
      content: data
    });

  } catch (error) {

    console.error("🔥 ERROR:", error);

    return res.status(500).json({
      success: false,
      error: error.message,
      content: safeContent(
        req.body?.topic || "Demo",
        error.message
      )
    });
  }
});

// ================= START =================

app.listen(PORT, () => {
  console.log("🚀 Server running on port", PORT);
});
