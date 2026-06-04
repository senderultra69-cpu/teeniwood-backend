import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Groq from "groq-sdk";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 10000;

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// Home
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "TeeniWood API Running"
  });
});

// Health
app.get("/health", (req, res) => {
  res.json({
    success: true,
    groq: !!process.env.GROQ_API_KEY
  });
});

// Fallback content
function safeContent(topic) {
  return {
    title: "🔥 " + topic,
    description: "AI Generated Content",
    seo_keywords: [topic, "viral", "ai"],
    hashtags: ["#viral", "#shorts", "#ai"],
    tags: [topic, "viral", "story"],
    hooks: [
      "🔥 Watch till the end",
      "😱 Unexpected twist",
      "🚀 Viral story"
    ],
    script: Array.from({ length: 10 }, (_, i) => ({
      scene: "Scene " + (i + 1),
      video_prompt:
        "Ultra cinematic 5-second short video, 4K quality, dramatic lighting, emotional atmosphere about " +
        topic +
        ", scene " +
        (i + 1) +
        ", Hollywood cinematic, shallow depth of field, film grain, dramatic color grading, ultra realistic, 9:16 vertical format.",
      voice_over:
        "Narration for scene " + (i + 1)
    }))
  };
}

// Generate
app.post("/api/generate", async (req, res) => {
  try {
    const topic = req.body.topic;

    if (!topic) {
      return res.status(400).json({
        success: false,
        error: "Topic required"
      });
    }

    const prompt = `
Return ONLY valid JSON.

Topic: ${topic}

JSON FORMAT:

{
  "title": "",
  "description": "",
  "seo_keywords": [],
  "hashtags": [],
  "tags": [],
  "hooks": [],
  "script": [
    {
      "scene": "Scene 1",
      "video_prompt": "",
      "voice_over": ""
    }
  ]
}

RULES:
- Generate exactly 10 scenes.
- Each scene must have:
  scene
  video_prompt
  voice_over
- Every video_prompt should be ultra cinematic.
- 4K quality.
- Hollywood style.
- Dramatic lighting.
- Emotional storytelling.
- Ultra realistic.
- 9:16 vertical format.
- Story should continue from Scene 1 to Scene 10.
- Return ONLY JSON.
`;

    const completion =
      await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.8
      });

    const raw =
      completion?.choices?.[0]?.message?.content || "";

    let cleaned = raw
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    let data;

    try {
      data = JSON.parse(cleaned);

      if (!Array.isArray(data.script)) {
        data.script = [];
      }

      while (data.script.length < 10) {
        data.script.push({
          scene: "Scene " + (data.script.length + 1),
          video_prompt:
            "Ultra cinematic 5-second short video, 4K quality, dramatic lighting, emotional atmosphere.",
          voice_over:
            "Voice over for scene " +
            (data.script.length + 1)
        });
      }

    } catch (err) {
      console.log("JSON Parse Failed");
      console.log(raw);

      data = safeContent(topic);
    }

    res.json({
      success: true,
      content: data
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
  console.log("🚀 Server running on port", PORT);
});
